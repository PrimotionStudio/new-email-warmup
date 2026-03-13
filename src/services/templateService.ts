interface EmailTemplate {
  subject: string;
  body: string;
}

const emailTemplates: EmailTemplate[] = [
  // Project Updates
  {
    subject: "Project Update: {{projectName}} Progress",
    body: `Hi {{recipientName}},

Just wanted to give you a quick update on the {{projectName}} project. We've made significant progress on [specific task] and are on track for our next milestone. I'll send a more detailed report next week.

Best,
{{senderName}}`,
  },
  {
    subject: "Weekly Sync for {{projectName}}",
    body: `Hello {{recipientName}},

This is a quick reminder for our weekly sync meeting for the {{projectName}} project today at [time]. Please come prepared to discuss [agenda item 1] and [agenda item 2].

Regards,
{{senderName}}`,
  },
  {
    subject: "Good news on the {{projectName}} front!",
    body: `Hi {{recipientName}},

Exciting news! We've successfully [achieved a goal] for the {{projectName}} project. This puts us ahead of schedule. Let's connect soon to discuss next steps.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Question regarding {{projectName}}",
    body: `Hi {{recipientName}},

I have a quick question about the {{projectName}} project regarding [specific point]. Could you clarify [your question]?

Thanks,
{{senderName}}`,
  },
  {
    subject: "Feedback requested: {{projectName}} deliverable",
    body: `Hello {{recipientName}},

We've completed the initial draft of the {{projectName}} deliverable. Your feedback would be greatly appreciated. Please find it attached and let me know your thoughts by [date].

Best regards,
{{senderName}}`,
  },

  // Meeting Follow-ups
  {
    subject: "Following up on our meeting about {{topic}}",
    body: `Hi {{recipientName}},

Thanks for a productive meeting today regarding {{topic}}. I've summarized our key discussion points and action items below:

1. [Action Item 1]
2. [Action Item 2]

I'll follow up on my action items by [date].

Best,
{{senderName}}`,
  },
  {
    subject: "Quick recap: {{meetingName}}",
    body: `Hello {{recipientName}},

Just a quick recap from our meeting about {{meetingName}}. It was great to connect. I'll be working on [your next step] and will keep you posted.

Cheers,
{{senderName}}`,
  },
  {
    subject: "Materials from {{meetingName}}",
    body: `Hi {{recipientName}},

Per our discussion during the {{meetingName}}, here are the materials we reviewed. Please let me know if you have any questions.

Regards,
{{senderName}}`,
  },
  {
    subject: "Next steps after {{discussionTopic}}",
    body: `Hello {{recipientName}},

Following our discussion on {{discussionTopic}}, I've outlined the proposed next steps. Let's confirm these align with your expectations.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Quick question from our last chat",
    body: `Hi {{recipientName}},

Something came to mind after our last chat. Regarding [specific point], could you provide more detail on [your question]?

Best,
{{senderName}}`,
  },

  // Approvals & Requests
  {
    subject: "Approval Request: {{documentName}}",
    body: `Hello {{recipientName}},

Please review and approve the attached {{documentName}}. We need your approval by [date] to proceed.

Thank you,
{{senderName}}`,
  },
  {
    subject: "Action Required: {{taskName}}",
    body: `Hi {{recipientName}},

This is a friendly reminder that your action is required on {{taskName}}. Please complete it by [date].

Best,
{{senderName}}`,
  },
  {
    subject: "Request for Information: {{topic}}",
    body: `Hello {{recipientName}},

I'm gathering information on {{topic}} and would appreciate your input on [specific question]. Please let me know if you can assist.

Regards,
{{senderName}}`,
  },
  {
    subject: "Can you help with {{request}}?",
    body: `Hi {{recipientName}},

I'm hoping you might be able to help me with {{request}}. Would you have a few minutes to discuss this?

Thanks,
{{senderName}}`,
  },
  {
    subject: "Urgent: Input needed for {{project}}",
    body: `Hello {{recipientName}},

Urgent input is needed from you for the {{project}}. Please provide your feedback on [specific item] by [deadline].

Best regards,
{{senderName}}`,
  },

  // Check-ins & General Business
  {
    subject: "Quick check-in",
    body: `Hi {{recipientName}},

Just checking in to see how things are going with [project/task]. Let me know if you need any support.

Best,
{{senderName}}`,
  },
  {
    subject: "Hoping you're well!",
    body: `Hello {{recipientName}},

Hope you're having a productive week! Just a friendly hello.

Cheers,
{{senderName}}`,
  },
  {
    subject: "Information for you: {{topic}}",
    body: `Hi {{recipientName}},

Thought you might find this information on {{topic}} useful. Let me know what you think.

Regards,
{{senderName}}`,
  },
  {
    subject: "Your thoughts on {{idea}}?",
    body: `Hello {{recipientName}},

I had an idea about {{idea}} and would love to get your thoughts on it when you have a moment.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Catching up soon?",
    body: `Hi {{recipientName}},

It's been a while! Let me know if you're free for a quick virtual coffee sometime next week to catch up.

Best,
{{senderName}}`,
  },

  // More variety
  {
    subject: "Regarding our recent discussion on {{topic}}",
    body: `Hi {{recipientName}},

Further to our discussion about {{topic}}, I've been doing some research and found [new information]. I think this could be beneficial.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Update on the {{initiativeName}} initiative",
    body: `Hello {{recipientName}},

Here's an update on the {{initiativeName}} initiative. We're progressing well, and I'll share more details next week.

Best regards,
{{senderName}}`,
  },
  {
    subject: "Proposal for {{projectName}}",
    body: `Hi {{recipientName}},

Attached is our proposal for the {{projectName}} project. Please review and let us know your thoughts.

Regards,
{{senderName}}`,
  },
  {
    subject: "Reminder: {{event/deadline}}",
    body: `Hello {{recipientName}},

Just a friendly reminder about {{event/deadline}} on [date]. Please ensure you're prepared.

Cheers,
{{senderName}}`,
  },
  {
    subject: "Looking forward to {{meeting/event}}",
    body: `Hi {{recipientName}},

Just wanted to say I'm looking forward to {{meeting/event}} on [date]. See you there!

Best,
{{senderName}}`,
  },

  {
    subject: "Follow-up: Action items from {{meetingName}}",
    body: `Hi {{recipientName}},

Following our {{meetingName}}, here's a recap of the action items assigned to you. Please confirm receipt and provide updates as they become available.

Best,
{{senderName}}`,
  },
  {
    subject: "Collaborative efforts on {{task}}",
    body: `Hello {{recipientName}},

I'm reaching out to coordinate our collaborative efforts on {{task}}. Could you share your availability for a quick sync next week?

Regards,
{{senderName}}`,
  },
  {
    subject: "New insights regarding {{data/report}}",
    body: `Hi {{recipientName}},

We've analyzed the latest {{data/report}} and found some new insights that might be of interest. I'll be happy to walk you through them.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Exploring options for {{challenge}}",
    body: `Hello {{recipientName}},

I'm currently exploring options to address {{challenge}}. Do you have any suggestions or resources that could help?

Best,
{{senderName}}`,
  },
  {
    subject: "Progress report: Phase 1 of {{project}}",
    body: `Hi {{recipientName}},

We've successfully completed Phase 1 of the {{project}}. A detailed report is attached for your review.

Sincerely,
{{senderName}}`,
  },

  {
    subject: "Input required for {{strategicPlan}}",
    body: `Hello {{recipientName}},

Your input is crucial for the development of our {{strategicPlan}}. Please provide your feedback on the attached document by [date].

Thank you,
{{senderName}}`,
  },
  {
    subject: "Introducing: {{newProduct/Service}}",
    body: `Hi {{recipientName}},

Excited to introduce our new {{newProduct/Service}}! I believe it could significantly benefit [recipient's area]. Let's connect for a demo.

Best regards,
{{senderName}}`,
  },
  {
    subject: "Your feedback on {{presentation/document}}",
    body: `Hello {{recipientName}},

We recently shared the {{presentation/document}}, and we're keen to hear your thoughts. Please share any feedback you have.

Regards,
{{senderName}}`,
  },
  {
    subject: "Opportunity to optimize {{process}}",
    body: `Hi {{recipientName}},

I've identified an opportunity to optimize {{process}} which could lead to [benefit]. Would you be open to discussing this further?

Thanks,
{{senderName}}`,
  },
  {
    subject: "Summary of {{workshop/session}}",
    body: `Hello {{recipientName}},

Here's a brief summary of our recent {{workshop/session}}, highlighting the key takeaways and action points.

Cheers,
{{senderName}}`,
  },

  {
    subject: "Connecting about {{sharedInterest}}",
    body: `Hi {{recipientName}},

I saw your post/comment about {{sharedInterest}} and wanted to connect. I'm working on something similar and would love to exchange ideas.

Best,
{{senderName}}`,
  },
  {
    subject: "Request for a quick chat: {{topic}}",
    body: `Hello {{recipientName}},

Could I schedule a quick 15-minute chat with you to discuss {{topic}}? Please let me know your availability.

Sincerely,
{{senderName}}`,
  },
  {
    subject: "Insight on {{industryTrend}}",
    body: `Hi {{recipientName}},

Just came across an interesting article about {{industryTrend}} and thought of you. Sharing it for your perusal.

Regards,
{{senderName}}`,
  },
  {
    subject: "Resource for {{project/task}}",
    body: `Hello {{recipientName}},

Found a useful resource that might help with {{project/task}}. Sharing it with you.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Meeting Confirmation: {{meetingPurpose}}",
    body: `Hi {{recipientName}},

This email confirms our meeting for {{meetingPurpose}} on [date] at [time]. Looking forward to it.

Best,
{{senderName}}`,
  },
  // Even more templates for variety
  {
    subject: "Follow-up: Your inquiry about {{product/service}}",
    body: `Hi {{recipientName}},

Following up on your inquiry about {{product/service}}. I've attached more details and would be happy to answer any questions.

Best,
{{senderName}}`,
  },
  {
    subject: "Important update regarding {{policy/procedure}}",
    body: `Hello {{recipientName}},

Please note this important update regarding {{policy/procedure}}. Action may be required from your end.

Regards,
{{senderName}}`,
  },
  {
    subject: "Invitation to collaborate on {{initiative}}",
    body: `Hi {{recipientName}},

We're launching a new initiative, {{initiative}}, and would love to invite you to collaborate. Your expertise in [area] would be invaluable.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Feedback received: {{topic}}",
    body: `Hello {{recipientName}},

Thank you for your feedback on {{topic}}. We're reviewing it and will get back to you shortly.

Best,
{{senderName}}`,
  },
  {
    subject: "Annual Review: {{performanceArea}}",
    body: `Hi {{recipientName}},

It's time for our annual review focusing on {{performanceArea}}. Please prepare your self-assessment by [date].

Sincerely,
{{senderName}}`,
  },
  {
    subject: "Clarification needed for {{report/document}}",
    body: `Hello {{recipientName}},

Could you provide some clarification on [specific section] in the {{report/document}}? Your insights would be helpful.

Regards,
{{senderName}}`,
  },
  {
    subject: "New strategy for {{marketSegment}}",
    body: `Hi {{recipientName}},

We've developed a new strategy for the {{marketSegment}} which I believe will yield significant results. Let's discuss soon.

Best,
{{senderName}}`,
  },
  {
    subject: "Your participation in {{survey/poll}}",
    body: `Hello {{recipientName}},

We'd appreciate your participation in our {{survey/poll}} to gather valuable insights. It only takes [time].

Thank you,
{{senderName}}`,
  },
  {
    subject: "Q&A Session: {{event}}",
    body: `Hi {{recipientName}},

We'll be holding a Q&A session for {{event}} on [date]. Please submit your questions beforehand if possible.

Cheers,
{{senderName}}`,
  },
  {
    subject: "Reminder: Timesheet submission",
    body: `Hello {{recipientName}},

Just a reminder to submit your timesheet for the period ending [date] by [time].

Best,
{{senderName}}`,
  },
  {
    subject: "Update on pending {{task/request}}",
    body: `Hi {{recipientName}},

Here's an update on your pending {{task/request}}. We're working on it and will provide a resolution by [date].

Regards,
{{senderName}}`,
  },
  {
    subject: "Meeting agenda for {{meetingTitle}}",
    body: `Hello {{recipientName}},

Attached is the agenda for our upcoming {{meetingTitle}}. Please review it and suggest any additional topics.

Thanks,
{{senderName}}`,
  },
  {
    subject: "Seeking your expertise on {{subject}}",
    body: `Hi {{recipientName}},

We're seeking your expertise on {{subject}} for an upcoming project. Would you be available for a brief consultation?

Best,
{{senderName}}`,
  },
  {
    subject: "Important announcement: {{topic}}",
    body: `Hello {{recipientName}},

This is an important announcement regarding {{topic}}. Please read the attached document for full details.

Sincerely,
{{senderName}}`,
  },
  {
    subject: "Review of {{quarterlyReport}}",
    body: `Hi {{recipientName}},

The {{quarterlyReport}} is ready for your review. Please provide your comments by [date].

Regards,
{{senderName}}`,
  },
];

const replyTemplates: string[] = [
  "Thanks for the update!",
  "Got it, appreciate the info.",
  "Understood. Will get back to you soon.",
  "Perfect, thanks!",
  "Great, I'll take a look.",
  "Sounds good.",
  "Acknowledged.",
  "Will do.",
  "Thanks for letting me know.",
  "Appreciate you keeping me in the loop.",
];

let lastSentTemplateIndex: number | null = null;

export function getRandomTemplate(senderName: string, recipientName: string, projectName?: string, topic?: string): EmailTemplate {
  let randomIndex: number;
  do {
    randomIndex = Math.floor(Math.random() * emailTemplates.length);
  } while (randomIndex === lastSentTemplateIndex && emailTemplates.length > 1); // Avoid repeating the same template back-to-back if more than one template exists

  lastSentTemplateIndex = randomIndex;
  const template = emailTemplates[randomIndex];

  let subject = template.subject.replace(/\{\{senderName\}\}/g, senderName).replace(/\{\{recipientName\}\}/g, recipientName);
  let body = template.body.replace(/\{\{senderName\}\}/g, senderName).replace(/\{\{recipientName\}\}/g, recipientName);

  if (projectName) {
    subject = subject.replace(/\{\{projectName\}\}/g, projectName);
    body = body.replace(/\{\{projectName\}\}/g, projectName);
  }
  if (topic) {
    subject = subject.replace(/\{\{topic\}\}/g, topic);
    body = body.replace(/\{\{topic\}\}/g, topic);
  }

  // Generic replacements for placeholders not explicitly provided
  subject = subject.replace(/\{\{.*?\}\}/g, 'our work'); // Replaces any remaining placeholders with a generic term
  body = body.replace(/\{\{.*?\}\}/g, 'our work');

  return { subject, body };
}

export function getRandomReply(): string {
  const randomIndex = Math.floor(Math.random() * replyTemplates.length);
  return replyTemplates[randomIndex];
}