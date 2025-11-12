'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { routing, type LocaleTuple } from '@/proxy';

// Language display names
const languageNames: Record<LocaleTuple, string> = {
  en: 'English',
  ko: '한국어'
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  // Get the pathname without the locale prefix
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  return (
    <div className="flex gap-2" suppressHydrationWarning>
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={`/${loc}${pathnameWithoutLocale}`}
          className={`px-4 py-2 font-nunito font-extrabold ${
            locale === loc
              ? 'text-white underline underline-offset-4'
              : 'text-blue-300 dark:text-blue-400 hover:text-blue-200 dark:hover:text-blue-300'
          }`}
        >
          {languageNames[loc]}
        </Link>
      ))}
    </div>
  );
}

