import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserConfirmationEmail } from "@/lib/email-templates/userConfirmation";
import { getAdminNotificationEmail } from "@/lib/email-templates/adminNotification";
import { verifyRecaptcha } from "@/lib/recaptcha/server";
import { withRecaptcha } from "@/lib/recaptcha/schema";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Base form fields schema
const formFields = {
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  email: z.email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
};

// Form data validation schema with reCAPTCHA
const dataCaptureSchema = withRecaptcha(formFields);

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = dataCaptureSchema.parse(body);

    // Verify reCAPTCHA token
    const verification = await verifyRecaptcha(validatedData.recaptchaToken);

    if (!verification.success) {
      console.error("reCAPTCHA verification failed:", verification.rawResponse);
      return NextResponse.json(
        {
          error: verification.reason ?? "reCAPTCHA verification failed. Please refresh and try again.",
        },
        { status: 400 }
      );
    }

    // Extract form data (excluding recaptchaToken) after successful verification
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { recaptchaToken: _, ...formData } = validatedData;

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    // Get the from email address (should be from your verified domain)
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@sealordskipper.com";
    const adminEmail = process.env.RESEND_ADMIN_EMAIL || "thomas@hiho.co.nz";
    const audienceId = process.env.RESEND_AUDIENCE_ID; // Optional: specific audience ID

    // Helper function to add delay between requests (minimum 500ms to respect 2 req/s limit)
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Helper function to handle rate limiting with retry
    // Handles both Resend SDK error objects ({ error }) and thrown exceptions
    const handleRateLimit = async <T extends { error?: unknown }>(
      fn: () => Promise<T>,
      retries = 3
    ): Promise<T> => {
      let lastResult: T | null = null;
      let lastError: unknown = null;

      for (let i = 0; i <= retries; i++) {
        try {
          const result = await fn();
          lastResult = result;

          // Check if Resend SDK returned an error object
          if (result.error) {
            const error = result.error as {
              statusCode?: number;
              name?: string;
              message?: string;
            };

            const statusCode = error?.statusCode;

            // If it's a rate limit error (429), retry with exponential backoff
            if (statusCode === 429 && i < retries) {
              lastError = error;
              // Exponential backoff: 500ms, 1000ms, 2000ms
              const backoffDelay = Math.pow(2, i) * 500;
              console.warn(
                `Resend rate limit hit (attempt ${i + 1}/${retries + 1}), retrying in ${backoffDelay}ms...`
              );
              await delay(backoffDelay);
              continue;
            }

            // For non-rate-limit errors or final attempt, return the result with error
            return result;
          }

          // Success - no error in result
          return result;
        } catch (error: unknown) {
          lastError = error;

          // Handle thrown exceptions (shouldn't happen with Resend SDK, but just in case)
          const err = error as { statusCode?: number; status?: number };
          const status = err?.statusCode || err?.status;

          if (status === 429 && i < retries) {
            const backoffDelay = Math.pow(2, i) * 500;
            console.warn(
              `Resend rate limit exception (attempt ${i + 1}/${retries + 1}), retrying in ${backoffDelay}ms...`
            );
            await delay(backoffDelay);
            continue;
          }

          // Re-throw if not rate limit or final attempt
          throw error;
        }
      }

      // If we exhausted retries, return last result or throw last error
      if (lastResult) {
        return lastResult;
      }
      throw lastError || new Error("Rate limit retries exhausted");
    };

    // Check if contact already exists before proceeding
    // If exists, return error; if not, create contact and send email
    let contactExists = false;
    try {
      const existingContact = await handleRateLimit(() =>
        resend.contacts.get({ email: formData.email })
      );

      // Check for error in Resend response
      if (existingContact.error) {
        const error = existingContact.error as { statusCode?: number; message?: string };
        // If contact doesn't exist (404), that's fine - we'll create it
        if (error.statusCode !== 404) {
          console.error("Error checking contact:", existingContact.error);
          // If we can't check, we'll proceed anyway (fail open)
        }
      } else if (existingContact.data) {
        // Contact exists
        contactExists = true;
      }
    } catch (getError: unknown) {
      // Fallback for unexpected exceptions
      console.error("Unexpected error checking contact:", getError);
      // Proceed anyway (fail open)
    }

    // Add delay before next API call to respect rate limits
    await delay(500);

    // If contact already exists, return error code (message will be handled by frontend based on locale)
    if (contactExists) {
      return NextResponse.json(
        {
          code: "ALREADY_REGISTERED",
        },
        { status: 409 } // Conflict status code
      );
    }

    // Contact doesn't exist, proceed with creating contact and sending email
    const contactData: {
      email: string;
      firstName: string;
      lastName: string;
      company?: string;
      country?: string;
      audienceId?: string;
    } = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    // Add optional fields
    if (formData.company) {
      contactData.company = formData.company;
    }
    if (formData.country) {
      contactData.country = formData.country;
    }

    // Add to specific audience if configured
    if (audienceId) {
      contactData.audienceId = audienceId;
    }

    // Create new contact
    try {
      const createResult = await handleRateLimit(() =>
        resend.contacts.create(contactData)
      );

      // Check for error in Resend response
      if (createResult.error) {
        const error = createResult.error as {
          statusCode?: number;
          message?: string;
        };
        // If contact was created between check and create (race condition), return error code
        if (
          error.statusCode === 409 ||
          error.message?.includes("already exists")
        ) {
          return NextResponse.json(
            {
              code: "ALREADY_REGISTERED",
            },
            { status: 409 }
          );
        }
        // For other errors, log but continue (we still want to send the email)
        console.error("Failed to create contact:", createResult.error);
      }
    } catch (createError: unknown) {
      // Fallback for unexpected exceptions
      const err = createError as { statusCode?: number; message?: string };
      if (err?.statusCode === 409 || err?.message?.includes("already exists")) {
        return NextResponse.json(
          {
            code: "ALREADY_REGISTERED",
          },
          { status: 409 }
        );
      }
      console.error("Failed to create contact (exception):", createError);
    }

    // Add delay before next API call to respect rate limits
    await delay(500);

    // Send confirmation email to user (with rate limit handling)
    const userEmailResult = await handleRateLimit(() =>
      resend.emails.send({
        from: fromEmail,
        to: formData.email,
        subject: "Thank You - Sealord Skipper",
        html: getUserConfirmationEmail(formData),
      })
    );

    // Check if email was sent successfully
    if (userEmailResult.error) {
      const error = userEmailResult.error as {
        statusCode?: number;
        name?: string;
        message?: string;
      };
      console.error("Resend API error sending user email:", userEmailResult.error);
      
      // If it's a rate limit error after retries, return a more specific error
      if (error.statusCode === 429) {
        return NextResponse.json(
          {
            error:
              "Service temporarily unavailable due to high demand. Please try again in a moment.",
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      );
    }

    // Add delay before next API call to respect rate limits
    await delay(500);

    // Send notification email to admin (optional, only if admin email is configured)
    if (adminEmail && adminEmail !== fromEmail) {
      try {
        const adminEmailResult = await handleRateLimit(() =>
          resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `New Data Capture - ${formData.firstName} ${formData.lastName}`,
            html: getAdminNotificationEmail(formData),
          })
        );

        // Check for error in Resend response
        if (adminEmailResult.error) {
          // Log but don't fail the request if admin email fails
          console.error(
            "Failed to send admin notification email:",
            adminEmailResult.error
          );
        }
      } catch (adminEmailError) {
        // Log but don't fail the request if admin email fails
        console.error(
          "Failed to send admin notification email (exception):",
          adminEmailError
        );
      }
    }

    return NextResponse.json(
      {
        message: "Data capture successful",
        id: userEmailResult.data?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.issues },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error("Data capture API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
