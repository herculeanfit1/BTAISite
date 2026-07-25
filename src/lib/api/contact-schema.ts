// Contact form validation schema, ported from the Azure Functions handler
// (api/src/functions/contact.ts) so validation behaviour — and the 400 error
// shape the frontend and CI depend on — matches.
//
// The `interest` enum is the one deliberate divergence: it carries the §7
// Strategy / Build / Operate taxonomy (2026-07-25) plus the retired slugs. The
// retired `api/` tree still has the old-only enum and is scheduled for deletion.
import { z } from "zod";

export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  company: z.string().max(100, "Company name too long").optional(),
  interest: z
    .enum([
      // Current taxonomy (§7, 2026-07-25) — the only values the form emits.
      "strategy-design",
      "custom-development",
      "deployment-operations",
      "general",
      "",
      // Retired taxonomy, still accepted transitionally. A visitor holding a
      // pre-cutover JS bundle submits these; rejecting them would 400 and
      // silently lose the lead — the failure §7 exists to prevent. Removed in
      // the §7 cleanup step, after the retired HubSpot options are pulled.
      "governance-assessment",
      "data-readiness",
      "copilot-readiness",
    ])
    .optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message too long"),
  _gotcha: z.string().optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
