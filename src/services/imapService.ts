import { ImapFlow } from "imapflow";
import logger from "../utils/logger";
import { sendWarmupEmail } from "./mailerService"; // Assuming mailerService for auto-replies
import { getRandomReply } from "./templateService"; // Assuming templateService for auto-replies
import { decrypt } from "./encryptionService"; // For decrypting IMAP password
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string; // This will be the decrypted password
  };
}

async function connectImapClient(config: ImapConfig): Promise<ImapFlow | null> {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
    logger: false, // Disable imapflow's internal logger to use winston
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    logger.info(`IMAP connected for user: ${config.auth.user}`);
    return client;
  } catch (error) {
    logger.error(
      `IMAP connection failed for user ${config.auth.user}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

export async function pollDomainImap(
  domainId: string,
  replyProbability: number,
): Promise<void> {
  logger.info(`Polling IMAP for domain ID: ${domainId}`);
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    logger.error(`Domain with ID ${domainId} not found for IMAP polling.`);
    return;
  }

  const imapConfig: ImapConfig = {
    host: domain.imapHost,
    port: domain.imapPort,
    secure: true, // Always use secure for IMAP
    auth: {
      user: domain.imapUser,
      pass: decrypt(domain.imapPass), // Decrypt password
    },
  };

  const client = await connectImapClient(imapConfig);
  if (!client) {
    return;
  }

  try {
    // 1. Check Spam/Junk/[Gmail]/Spam and move warmup emails to inbox
    await client.mailboxOpen("INBOX");

    const spamFolders = ["Spam", "Junk", "[Gmail]/Spam"]; // Common spam folder names

    for (const folder of spamFolders) {
      try {
        const mailbox = await client.mailboxOpen(folder);
        if (mailbox) {
          logger.debug(
            `Checking spam folder: ${folder} for ${domain.imapUser}`,
          );
                              const messages = client.fetch(
                                { seen: false, header: { "X-Warmup": "true" } },
                                { headers: true, uid: true, envelope: true }
                              );
                    
                              for await (const msg of messages) {
                                if (msg.headers) {
                                  const headersString = msg.headers.toString();
                                  if (headersString.includes("X-Warmup: true")) {
                                    logger.info(
                                      `Found warmup email in ${folder}. Moving to INBOX.`
                                    );
                                    await client.messageMove(msg.uid, "INBOX", { uid: true });
                                    await prisma.warmupLog.create({
                                      data: {
                                        fromDomainId: domain.id,
                                        toDomainId: domain.id,
                                        toEmail: domain.fromEmail,
                                        subject: msg.envelope?.subject || "No Subject",
                                        body: "Moved from spam to inbox",
                                        status: "MOVED_TO_INBOX",
                                      },
                                    });
                                  }
                                }
                              }
                            }
                          } catch (e) {
                            logger.warn(
                              `Could not open or process folder "${folder}" for ${
                                domain.imapUser
                              }: ${e instanceof Error ? e.message : String(e)}`
                            );
                          }
                        }
                    
                        // 2. Find unseen warmup emails in INBOX
                        logger.debug(
                          `Checking INBOX for unseen warmup emails for ${domain.imapUser}`
                        );
                        const inboxMessages = client.fetch(
                          { seen: false, header: { "X-Warmup": "true" } },
                          { headers: true, uid: true, source: true, envelope: true } // Fetch source to get body if needed
                        );
                    
                        for await (const msg of inboxMessages) {
                          if (msg.headers) {
                            const headersString = msg.headers.toString();
                            if (headersString.includes("X-Warmup: true")) {
                              logger.info(`Found unseen warmup email in INBOX. Marking as read.`);
                              await client.messageFlagsAdd(msg.uid, ["\\Seen"], { uid: true });
                    
                              // 3. Maybe auto-reply
                              if (Math.random() < replyProbability) {
                                logger.info(
                                  `Auto-replying to warmup email for ${domain.imapUser}.`
                                );
                    
                                // Extract sender details from the email
                                const from = msg.envelope?.from?.[0];
                                const senderEmail = from?.address || "unknown@example.com";
                                const senderName = from?.name || "Sender";
                    
                                if (!senderEmail) {
                                  logger.warn(
                                    `Could not extract sender email from envelope: ${JSON.stringify(
                                      msg.envelope
                                    )}`
                                  );
                                  continue;
                                }
                    
                                const replySubject = `Re: ${
                                  msg.envelope?.subject || "No Subject"
                                }`;
                                const replyBody = getRandomReply();
                    
                                const success = await sendWarmupEmail({
                                  from: domain.fromEmail,
                                  to: senderEmail,
                                  subject: replySubject,
                                  html: `<p>${replyBody}</p>`,
                                  smtpConfig: {
                                    host: domain.smtpHost,
                                    port: domain.smtpPort,
                                    secure: true,
                                    auth: {
                                      user: domain.smtpUser,
                                      pass: decrypt(domain.smtpPass),
                                    },
                                  },
                                });
                    
                                if (success) {
                                  await prisma.warmupLog.create({
                                    data: {
                                      fromDomainId: domain.id,
                                      toDomainId: domain.id, // Replying to a received email from another warmup domain
                                      toEmail: senderEmail,
                                      subject: replySubject,
                                      body: replyBody,
                                      status: "REPLIED",
                                    },
                                  });
                                } else {
                                  logger.error(
                                    `Failed to send auto-reply for domain ${domain.id} to ${senderEmail}`
                                  );
                                }
                              }
                            }
                          }
          
    }
  } catch (error) {
    logger.error(
      `Error during IMAP polling for domain ${domain.imapUser}: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    await client.logout();
  }
}

export async function testImapConnection(
  imapConfig: ImapConfig,
): Promise<boolean> {
  const client = new ImapFlow({
    host: imapConfig.host,
    port: imapConfig.port,
    secure: imapConfig.secure,
    auth: {
      user: imapConfig.auth.user,
      pass: imapConfig.auth.pass,
    },
    logger: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    await client.logout();
    logger.info(`IMAP connection successful for user: ${imapConfig.auth.user}`);
    return true;
  } catch (error) {
    logger.error(
      `IMAP connection failed for user ${imapConfig.auth.user}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}
