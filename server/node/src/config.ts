import { z } from "zod/v4";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  HOSTNAME: z.string().default("localhost"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "trace"]).default("info"),
  PAYPAL_SANDBOX_CLIENT_ID: z.string().optional(),
  PAYPAL_SANDBOX_CLIENT_SECRET: z.string().optional(),
  DOMAINS: z.string().optional(),
  CLIENT_STATIC_DIRECTORY: z.string().optional(),
  WELL_KNOWN_STATIC_DIRECTORY: z.string().optional(),
  NGROK_AUTHTOKEN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
});

export const config = envSchema.parse(process.env);
