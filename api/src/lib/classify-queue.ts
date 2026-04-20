const HUBSPOT_PORTAL_ID = parseInt(process.env.HUBSPOT_PORTAL_ID ?? "245473112", 10);
const MAX_EXCERPT_LENGTH = 500;
const MAX_PAYLOAD_BYTES = 8192;

export interface ClassifyMessage {
  schemaVersion: 1;
  submittedAt: string;
  hubspot: {
    contactId: string;
    noteId: string | null;
    portalId: number;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
  };
  inquiry: {
    interestRaw: string | null;
    inquiryTopic: string;
    leadPriority: string;
    messageExcerpt: string;
  };
  source: {
    submissionUrl: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    ip: string | null;
    userAgent: string | null;
  };
}

export interface BuildClassifyMessageInput {
  submittedAt: string;
  contactId: string;
  noteId: string | null;
  body: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    message: string;
    interest?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  inquiryTopic: string;
  leadPriority: string;
  ip: string | null;
  userAgent: string | null;
  submissionUrl: string | null;
}

export class QueueMessageTooLargeError extends Error {
  constructor(public readonly sizeBytes: number) {
    super(`Queue message too large: ${sizeBytes} bytes (max ${MAX_PAYLOAD_BYTES})`);
    this.name = "QueueMessageTooLargeError";
  }
}

function truncateExcerpt(text: string): string {
  const collapsed = text.trim().replace(/\s+/g, " ");
  if (collapsed.length <= MAX_EXCERPT_LENGTH) return collapsed;
  return collapsed.slice(0, MAX_EXCERPT_LENGTH) + "\u2026";
}

export function buildClassifyMessage(input: BuildClassifyMessageInput): ClassifyMessage {
  const msg: ClassifyMessage = {
    schemaVersion: 1,
    submittedAt: input.submittedAt,
    hubspot: {
      contactId: input.contactId,
      noteId: input.noteId,
      portalId: HUBSPOT_PORTAL_ID,
    },
    contact: {
      firstName: input.body.firstName,
      lastName: input.body.lastName,
      email: input.body.email,
      company: input.body.company ?? null,
    },
    inquiry: {
      interestRaw: input.body.interest ?? null,
      inquiryTopic: input.inquiryTopic,
      leadPriority: input.leadPriority,
      messageExcerpt: truncateExcerpt(input.body.message),
    },
    source: {
      submissionUrl: input.submissionUrl,
      utmSource: input.body.utmSource ?? null,
      utmMedium: input.body.utmMedium ?? null,
      utmCampaign: input.body.utmCampaign ?? null,
      ip: input.ip,
      userAgent: input.userAgent,
    },
  };

  const serialized = JSON.stringify(msg);
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    throw new QueueMessageTooLargeError(serialized.length);
  }

  return msg;
}
