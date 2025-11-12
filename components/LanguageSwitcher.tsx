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
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            locale === loc
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {languageNames[loc]}
        </Link>
      ))}
    </div>
  );
}

