// Per-submission correlation ID (plan Q6). A short id logged at each stage
// (validated -> emailed -> hubspot -> enqueued) so one lead's path is traceable
// in the managed-backend console logs without App Insights. Not security
// material; collision-resistance is not required.

export function newCorrelationId(): string {
  try {
    return globalThis.crypto.randomUUID().slice(0, 8);
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}
