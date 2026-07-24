// The single point of queue wire-format encoding, kept separate from the Azure
// SDK client so it is unit-testable in isolation (plan Q5).
//
// base64(JSON.stringify(msg)) reproduces the Azure Functions Queues extension v5
// default (messageEncoding=base64) that the n8n consumer decodes. If the
// consumer is ever proven to expect raw JSON, this is the ONE function to flip.
import type { ClassifyMessage } from "./classify-queue";

export function encodeClassifyMessage(msg: ClassifyMessage): string {
  return Buffer.from(JSON.stringify(msg), "utf8").toString("base64");
}
