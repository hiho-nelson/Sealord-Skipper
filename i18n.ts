import { getRequestConfig } from 'next-intl/server';
import { routing, type LocaleTuple } from './proxy';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as LocaleTuple)) {
    locale = routing.defaultLocale;
  }

  // Load common translations and page-specific translations
  const [commonMessages, pageMessages] = await Promise.all([
    import(`./messages/${locale}/_common.json`).then((m) => m.default).catch(() => ({})),
    import(`./messages/${locale}.json`).then((m) => m.default).catch(() => ({}))
  ]);

  // Merge common translations with page-specific translations
  // Common translations are prefixed with underscore to indicate they're shared
  const messages = {
    ...pageMessages,
    _common: commonMessages
  };

  return {
    locale,
    messages
  };
});

