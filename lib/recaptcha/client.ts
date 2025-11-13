"use client"

import { useEffect, useState, useCallback, useRef } from "react"

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>
    }
  }
}

interface UseRecaptchaOptions {
  action?: string
}

interface UseRecaptchaReturn {
  execute: (options?: UseRecaptchaOptions) => Promise<string>
  isReady: boolean
  error: Error | null
}

/**
 * Client-side hook for Google reCAPTCHA v3
 * @param action - The action name for reCAPTCHA (default: "submit")
 * @returns Object with execute function, isReady state, and error state
 */
export function useRecaptcha(
  action: string = "submit"
): UseRecaptchaReturn {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (!siteKey) {
      // Use setTimeout to defer state update and avoid synchronous setState in effect
      setTimeout(() => {
        setError(
          new Error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured")
        )
      }, 0)
      return
    }

    // Load the reCAPTCHA script if not already loaded
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setIsReady(true)
      })
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="recaptcha"]'
    )
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            setIsReady(true)
          })
          clearInterval(checkInterval)
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    // Load the script
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true)
        })
      }
    }

    script.onerror = () => {
      setError(new Error("Failed to load reCAPTCHA script"))
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup: remove script if component unmounts
      // Note: We don't remove it if other components might be using it
    }
  }, [])

  const execute = useCallback(
    async (options?: UseRecaptchaOptions): Promise<string> => {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

      if (!siteKey) {
        throw new Error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured")
      }

      if (!window.grecaptcha) {
        throw new Error("reCAPTCHA is not loaded")
      }

      if (!isReady) {
        throw new Error("reCAPTCHA is not ready")
      }

      const actionToUse = options?.action || action

      try {
        const token = await window.grecaptcha.execute(siteKey, {
          action: actionToUse,
        })
        return token
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to execute reCAPTCHA")
        setError(error)
        throw error
      }
    },
    [action, isReady]
  )

  return { execute, isReady, error }
}

