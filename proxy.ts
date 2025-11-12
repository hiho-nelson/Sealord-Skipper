import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export type Locale = 'en' | 'ko';

export const routing = {
  // A list of all locales that are supported
  locales: ['en', 'ko'] as const,

  // Used when no locale matches
  defaultLocale: 'en' as const
} as const;

export type LocaleTuple = typeof routing.locales[number];

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

