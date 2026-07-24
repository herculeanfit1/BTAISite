// Storage Queue enqueue for lead-classification messages.
//
// This replaces the Azure Functions storage-queue OUTPUT BINDING
// (context.extraOutputs.set) that has no Next.js equivalent. Auth is a
// queue-scoped, add-only SAS URL supplied via the CLASSIFY_QUEUE_SAS_URL app
// setting (plan §5.1 / A3) — least privilege, no account key.
//
// WIRE FORMAT — base64(JSON.stringify(msg)). The output binding this replaces
// used the Functions Queues extension v5 default `messageEncoding=base64`
// (api/host.json set no override), so the n8n consumer base64-decodes the
// message text. We reproduce that byte-for-byte. Phase 3 verifies end-to-end by
// peeking an enqueued message and confirming the consumer processes it; if the
// consumer ever proves to expect raw JSON, flip `encodeClassifyMessage` — it is
// the single point of encoding.
import { QueueClient } from "@azure/storage-queue";
import type { ClassifyMessage } from "./classify-queue";
import { encodeClassifyMessage } from "./queue-encoding";

export { encodeClassifyMessage };

let queueClient: QueueClient | null = null;

function getQueueClient(): QueueClient {
  if (!queueClient) {
    const sasUrl = process.env.CLASSIFY_QUEUE_SAS_URL;
    if (!sasUrl) {
      throw new Error(
        "Missing required environment variable: CLASSIFY_QUEUE_SAS_URL",
      );
    }
    queueClient = new QueueClient(sasUrl);
  }
  return queueClient;
}

/** Enqueue a classification message. Throws on failure — the caller swallows it (non-blocking, plan A1). */
export async function enqueueClassify(msg: ClassifyMessage): Promise<void> {
  await getQueueClient().sendMessage(encodeClassifyMessage(msg));
}
