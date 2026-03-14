# Email Domain Warmup API

This is a REST API that warms up email domains by automatically exchanging realistic-looking business emails between a pool of managed domains. It's designed to build sender reputation with email providers like Gmail over time.

---

## How It Works

The system operates in two main cycles:

1.  **Email Sending (Warmup)**: Every 30 minutes (configurable), a scheduler checks for active domains. For each domain, it decides whether to send an email based on a daily limit and a "jitter" probability. This jitter helps to mimic more natural sending patterns. If it decides to send, it picks another random active domain, generates a realistic business email from a template, and sends it via SMTP. Every send attempt is logged.

2.  **IMAP Polling**: Every 15 minutes (configurable), a poller connects to each active domain's mailbox via IMAP. It performs the following actions:
    -   Searches for warmup emails (`X-Warmup: true` header) in spam folders (e.g., "Spam", "Junk") and moves them to the `INBOX`.
    -   Finds unseen warmup emails in the `INBOX` and marks them as read.
    -   Based on a configurable probability, it may send a short, realistic reply to the warmup email.

This continuous process of sending, receiving, moving from spam, and replying helps to build a positive reputation for the email domains, increasing the likelihood that their legitimate emails will land in the inbox.

---

## Stack

-   **Backend**: Node.js, Express, TypeScript
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Email**: Nodemailer (SMTP sending), imapflow (IMAP reading)
-   **Scheduling**: node-cron
-   **Validation**: Zod
-   **Logging**: Winston

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/new-email-warmup.git
cd new-email-warmup
```

### 2. Install dependencies

This project uses `bun` as the package manager and runtime.

```bash
bun install
```

### 3. Set up the database

You need a PostgreSQL database. Create a new database and get the connection string.

### 4. Configure Environment Variables

Create a `.env` file in the root of the project by copying the `.env.example` file:

```bash
cp .env.example .env
```

Now, edit the `.env` file with your specific configuration.

```env
# Server Configuration
PORT=9999
NODE_ENV=development # 'production' for production

# Database URL
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB"

# API Security
API_KEY="your-super-secret-key" # Used for the X-API-Key header

# Encryption Key (MUST be exactly 32 characters)
ENCRYPTION_KEY="12345678901234567890123456789012"

# Default Warmup Settings
DEFAULT_DAILY_LIMIT=10
SEND_WINDOW_START="08:00" # UTC time
SEND_WINDOW_END="20:00"   # UTC time
REPLY_PROBABILITY=0.7     # 70% chance to reply

# Scheduler Intervals (in minutes)
SCHEDULER_INTERVAL_MINUTES=30
IMAP_POLL_INTERVAL_MINUTES=15
```

### 5. Apply database schema

This command will create the necessary tables in your database based on the Prisma schema.

```bash
bun prisma db push
```

### 6. Start the API

```bash
bun run start
```

The API should now be running on `http://localhost:9999`.

---

## API Reference

All routes require the `X-API-Key` header for authentication.

| Method | Endpoint                      | Description                                                  |
| :----- | :---------------------------- | :----------------------------------------------------------- |
| **Domains** |                               |                                                              |
| `POST` | `/api/domains`                | Add a new domain. Passwords are encrypted automatically.     |
| `GET`  | `/api/domains`                | Get a list of all domains with `sentToday` counts.         |
| `GET`  | `/api/domains/:id`            | Get a single domain by its ID with `sentToday` count.        |
| `PUT`  | `/api/domains/:id`            | Update a domain.                                             |
| `DELETE`| `/api/domains/:id`            | Delete a domain.                                             |
| `POST` | `/api/domains/:id/test`       | Test SMTP and IMAP connections for a domain.                 |
| **Config** |                              |                                                              |
| `GET`  | `/api/config`                 | Get all current warmup configurations.                       |
| `PUT`  | `/api/config`                 | Update one or more warmup configurations.                    |
| **Logs** |                                |                                                              |
| `GET`  | `/api/logs`                   | Get warmup logs with filtering and pagination.               |
| `GET`  | `/api/logs/:id`               | Get a single log entry by its ID.                            |
| **Stats** |                               |                                                              |
| `GET`  | `/api/stats/summary`          | Get aggregate stats (total domains, counts per status).      |
| `GET`  | `/api/stats/daily`            | Get a per-day breakdown of sends. Query `?days=30`.          |
| **Warmup** |                              |                                                              |
| `POST` | `/api/warmup/trigger`         | Trigger a warmup cycle for all active domains immediately.     |
| `POST` | `/api/warmup/trigger/:domainId` | Trigger a single warmup email from a specific domain.        |

---

## Walkthrough Example (using `curl`)

Here's a full example of how to use the API.

**Your API Key**: For these examples, we'll assume your `API_KEY` is `your-super-secret-key`.

### Step 1: Add a Domain

Let's add the first domain.

```bash
curl -X POST http://localhost:9999/api/domains \
-H "Content-Type: application/json" \
-H "X-API-Key: your-super-secret-key" \
-d '{
  "fromName": "John Doe",
  "fromEmail": "john.doe@domain-a.com",
  "smtpHost": "smtp.domain-a.com",
  "smtpPort": 587,
  "smtpUser": "john.doe",
  "smtpPass": "smtp_password_a",
  "imapHost": "imap.domain-a.com",
  "imapPort": 993,
  "imapUser": "john.doe",
  "imapPass": "imap_password_a",
  "dailyLimit": 20
}'
```

*(You will need to add at least a second domain for the warmup to work)*

### Step 2: Test the Domain Connection

Now, test if the SMTP and IMAP credentials are correct. Replace `:id` with the actual ID you received from the previous step.

```bash
curl -X POST http://localhost:9999/api/domains/YOUR_DOMAIN_ID/test \
-H "X-API-Key: your-super-secret-key"
```

You should get a response like:
```json
{
  "smtpConnection": "OK",
  "imapConnection": "OK"
}
```

### Step 3: Trigger a Manual Warmup

Let's manually trigger a warmup cycle. This will attempt to send an email from each active domain to another random active domain.

```bash
curl -X POST http://localhost:9999/api/warmup/trigger \
-H "X-API-Key: your-super-secret-key"
```

The response will tell you how many emails were sent, skipped, or failed.
```json
{
  "sent": 2,
  "skipped": 0,
  "failed": 0
}
```

### Step 4: Check the Logs

Finally, check the logs to see the record of the email that was just sent.

```bash
curl -X GET "http://localhost:9999/api/logs?limit=5" \
-H "X-API-Key: your-super-secret-key"
```

This will return a paginated list of the most recent log entries.
```json
{
  "data": [
    {
      "id": "log-id-123",
      "fromDomainId": "domain-id-a",
      "toDomainId": "domain-id-b",
      "toEmail": "jane.doe@domain-b.com",
      "subject": "Project Update: Our Work Progress",
      "body": "...",
      "status": "SENT",
      "errorMessage": null,
      "sentAt": "2026-03-13T10:00:00.000Z",
      "fromDomain": { "id": "domain-id-a", "fromEmail": "john.doe@domain-a.com" },
      "toDomain": { "id": "domain-id-b", "fromEmail": "jane.doe@domain-b.com" }
    }
  ],
  "pagination": { ... }
}
```
