import { z } from "zod";

// Define the schema for your environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  EXPO_PUBLIC_API_URL: z.url(),
});

// Parse and validate process.env
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

// Export the validated environment variables
export const env = _env.data;
