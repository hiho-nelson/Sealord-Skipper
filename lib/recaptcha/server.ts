/**
 * Server-side reCAPTCHA verification
 * Verifies the reCAPTCHA token with Google's API
 */

export interface RecaptchaVerificationResult {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  reason?: string
  rawResponse?: unknown
}

export async function verifyRecaptcha(
  token: string
): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not configured")
    return {
      success: false,
      reason: "reCAPTCHA is not configured on the server",
    }
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    )

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        reason: data["error-codes"]?.join(", ") || "Verification failed",
        rawResponse: data,
      }
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      rawResponse: data,
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return {
      success: false,
      reason: "Failed to verify reCAPTCHA token",
      rawResponse: error,
    }
  }
}

