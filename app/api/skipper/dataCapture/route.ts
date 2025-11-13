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

    // Helper function to handle rate limiting with retry
    const handleRateLimit = async <T>(
      fn: () => Promise<T>,
      retries = 2
    ): Promise<T> => {
      let lastError: unknown;

      for (let i = 0; i <= retries; i++) {
        try {
          return await fn();
        } catch (error: unknown) {
          lastError = error;

          const err = error as { statusCode?: number; status?: number; response?: { headers?: Record<string, string> } };
          const status = err?.statusCode || err?.status;

          if (status === 429 && i < retries) {
            // Try reading reset header
            const reset = Number(err?.response?.headers?.["x-ratelimit-reset"]);

            // If header exists, wait exactly the required cooldown
            const delay = reset ? reset * 1000 : Math.pow(2, i) * 500;

            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw error;
        }
      }

      throw lastError;
    };

    // Check if contact already exists before proceeding
    // If exists, return error; if not, create contact and send email
    let contactExists = false;
    try {
      const existingContact = await handleRateLimit(() =>
        resend.contacts.get({ email: formData.email })
      );

      if (existingContact && !existingContact.error) {
        contactExists = true;
      }
    } catch (getError: unknown) {
      const err = getError as { statusCode?: number };
      // If contact doesn't exist (404), that's fine - we'll create it
      // Only log other errors
      if (err?.statusCode !== 404) {
        console.error("Error checking contact:", getError);
        // If we can't check, we'll proceed anyway (fail open)
      }
    }

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
      await handleRateLimit(() => resend.contacts.create(contactData));
    } catch (createError: unknown) {
      const err = createError as { statusCode?: number; message?: string };
      // If contact was created between check and create (race condition), return error code
      if (err?.statusCode === 409 || err?.message?.includes("already exists")) {
        return NextResponse.json(
          {
            code: "ALREADY_REGISTERED",
          },
          { status: 409 }
        );
      }
      // For other errors, log but continue (we still want to send the email)
      console.error("Failed to create contact:", createError);
    }

    // Send confirmation email to user (with rate limit handling)
    const userEmailResult = await handleRateLimit(() =>
      resend.emails.send({
        from: fromEmail,
        to: formData.email,
        subject: "Thank You - Sealord Skipper",
        html: getUserConfirmationEmail(formData),
      })
    );

    // Send notification email to admin (optional, only if admin email is configured)
    if (adminEmail && adminEmail !== fromEmail) {
      try {
        await handleRateLimit(() =>
          resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `New Data Capture - ${formData.firstName} ${formData.lastName}`,
            html: getAdminNotificationEmail(formData),
          })
        );
      } catch (adminEmailError) {
        // Log but don't fail the request if admin email fails
        console.error(
          "Failed to send admin notification email:",
          adminEmailError
        );
      }
    }

    // Check if email was sent successfully
    if (userEmailResult.error) {
      console.error("Resend API error:", userEmailResult.error);
      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      );
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
