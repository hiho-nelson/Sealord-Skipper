import { z } from "zod"

/**
 * Wraps a Zod object schema to include a recaptchaToken field
 * @param fields - The base form fields schema
 * @returns A new schema that includes recaptchaToken
 */
export function withRecaptcha<T extends z.ZodRawShape>(
  fields: T
): z.ZodObject<T & { recaptchaToken: z.ZodString }> {
  return z.object({
    ...fields,
    recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
  }) as z.ZodObject<T & { recaptchaToken: z.ZodString }>
}

