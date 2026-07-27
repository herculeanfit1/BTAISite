// Output encoding for the HTML sinks in the API layer: the two Resend email
// templates and the HubSpot note body. Escaping belongs here, at the sink —
// NOT in the Zod schema. Sanitising on input mangles legitimate messages (a
// prospect writing "R&D" or quoting code) and still leaves every other sink
// unprotected the moment one is added.
//
// The five characters below are the standard HTML text/attribute set. Escaping
// both quote styles is what makes this safe inside an attribute value, which
// matters for the `mailto:` hrefs in the admin notification.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape, then render newlines as `<br />`.
 *
 * Only for user text in a container that does NOT already set
 * `white-space: pre-wrap` — with pre-wrap the newline is preserved by CSS and
 * adding `<br />` produces a doubled line break. The confirmation template
 * needs this; the admin template does not (its `.message-content` is pre-wrap).
 *
 * `&` is escaped first by escapeHtml, so the `<br />` inserted here is the only
 * markup in the output and cannot be forged by the input.
 */
export function escapeHtmlMultiline(s: string): string {
  return escapeHtml(s).replace(/\r\n|\r|\n/g, "<br />");
}
