import { z } from "zod";

/**
 * Environment variable schema validation with Zod
 * This ensures that our application has all the required
 * environment variables of the correct type before starting.
 *
 * Note that undefined values for optional env vars will
 * be replaced with default values defined in the schema.
 */

// Define the schema for the environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Server and build configuration
  PORT: z.coerce.number().default(3000),

  // Analytics
  GA4_MEASUREMENT_ID: z.string().optional().default(""),

  // API keys and external services
  API_BASE_URL: z.string().url().default("http://localhost:3000/api"),

  // Auth related
  AUTH_SECRET: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // Storage
  STORAGE_BUCKET: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

// Process.env has a different type definition than what our schema expects
// so we need to cast it to unknown first
const _env = envSchema.safeParse(process.env);

// If validation fails, throw a helpful error
if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());

  throw new Error("Invalid environment variables");
}

// Export validated and correctly typed environment variables
export const env = _env.data;
