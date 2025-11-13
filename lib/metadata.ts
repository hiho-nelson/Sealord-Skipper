import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

/**
 * Generate page metadata for internationalized pages
 * @param locale - The locale string (e.g., 'en', 'ko')
 * @param namespace - The translation namespace (e.g., 'SkipperPage')
 * @returns Promise<Metadata> - Next.js metadata object
 */
export async function generatePageMetadata(
  locale: string,
  namespace: string
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

