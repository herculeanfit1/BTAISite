// Contact form validation schema, ported verbatim from the Azure Functions
// handler (api/src/functions/contact.ts) so validation behaviour — and the 400
// error shape the frontend and CI depend on — is byte-identical.
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
      "governance-assessment",
      "data-readiness",
      "copilot-readiness",
      "general",
      "",
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
