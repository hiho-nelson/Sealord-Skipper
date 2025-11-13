import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SkipperForm from "@/components/SkipperForm";
import Image from "next/image";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generatePageMetadata(locale, "SkipperPage");
}

export default async function SkipperPage() {
  const t = await getTranslations("SkipperPage");

  return (
    <div className="min-h-screen bg-[#f0ecec]">
      {/* SEO h1 - visually hidden but accessible to search engines */}
      <h1 className="sr-only hidden">Sealord Skipper</h1>
      
      {/* Header with Language Switcher */}
      <div className="absolute top-12 left-0 right-0 z-50 flex items-center justify-between px-4 max-w-[1080px] mx-auto w-full">
        <div className="flex items-center">
          <Image
            src="/images/sealord_logo.svg"
            alt="Sealord Logo"
            width={108}
            height={32}
            className="w-28 h-auto"
            priority
            sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 144px"
          />
        </div>
        <div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] flex items-end bg-[#001a72]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 max-w-[1080px] mx-auto">
          <Image
            src="/images/bb4.jpg"
            alt="Skipper Banner"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 1080px) 100vw, 1080px"
          />
        </div>

        <div className="relative z-10 max-w-[1080px] mx-auto w-full">
          <div className="flex flex-row items-end justify-between gap-8">
            {/* Brand Name and Tagline */}
            <div className="flex-2 lg:text-left text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-nunito font-extrabold">
              <p className="md:mb-2 drop-shadow-md">
                {t("tagline1")}
              </p>
              <p className="drop-shadow-md">
                {t("tagline2")}
              </p>
            </div>

            {/* Product Images */}
            <div className="flex-1 justify-center lg:justify-end flex">
              <Image
                src="/images/petfoodpak1.png"
                alt="Skipper Dog Food"
                width={288}
                height={244}
                className="object-contain rounded-lg w-96 sm:w-72 aspect-288/244 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                style={{ height: 'auto' }}
                sizes="(max-width: 640px) 192px, (max-width: 1024px) 288px, 288px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Introduction & Form Section */}
      <section className="bg-gray-50 pt-16 pb-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Introduction */}
            <div className="font-montserrat font-medium">
              <h2 className="text-4xl md:text-[45px] text-gray-900 mb-6 font-nunito font-black">
                {t("heroTitle")}
              </h2>
              <p className="text-lg text-gray-700 mb-4">{t("intro1")}</p>
              <h3 className="text-2xl md:text-[28px] text-gray-900 mb-2 font-nunito font-black">{t("intro2Title")}</h3>
              <p className="text-lg text-gray-700">{t("intro2")}</p>
            </div>

            {/* Right: Sign-up Form */}
            <SkipperForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center text-sm">
            {/* Feature 1 */}
            <div className="p-6 bg-[#d19d51]">
              <div className="mb-8 flex justify-center items-center">
                <Image
                  src="/images/f_1.svg"
                  alt="Feature 1 Icon"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                />
              </div>
              <p>{t("feature1Desc")}</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-[#009ba4]">
              <div className="mb-8 flex justify-center items-center">
                <Image
                  src="/images/f_2.svg"
                  alt="Feature 2 Icon"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                />
              </div>
              <p>{t("feature2Desc")}</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-[#ffd35f]">
              <div className="mb-8 flex justify-center items-center">
                <Image
                  src="/images/f_3.svg"
                  alt="Feature 3 Icon"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                />
              </div>
              <p>{t("feature3Desc")}</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-[#c76aa7]">
              <div className="mb-8 flex justify-center items-center">
                <Image
                  src="/images/f_4.svg"
                  alt="Feature 4 Icon"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                />
              </div>
              <p>{t("feature4Desc")}</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-[#95d0c7]">
              <div className="mb-8 flex justify-center items-center">
                <Image
                  src="/images/f_5.svg"
                  alt="Feature 5 Icon"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                />
              </div>
              <p>{t("feature5Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-[#32c2d9] relative w-full">
        {/* Upper Section */}
        <div className="px-4 sm:px-6 lg:px-8 relative z-50">
          <div className="max-w-[1080px] py-16 mx-auto">
            <div className="max-w-[400px] flex flex-col gap-2">
              <h3 className="text-xl font-nunito font-black">
                {t("footerTitle")}
              </h3>
              <p className="text-sm">
                {t("footerDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Lower Section */}
        {/* Lower Footer Section with waves and taglines */}
        <div className="bg-[#001b72] py-16 text-white relative px-4 sm:px-6 lg:px-8">
          {/* Decorative filled wave using SVG mask */}
          <div
            className="wave-fill animate-wave absolute top-0 left-0 w-full h-full z-10"
            style={{
              height: "60px",
              background: "#001b72",
              // Use SVG as a repeating mask for the wave effect (for browsers supporting mask)
              mask: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10 V20 H0 Z' fill='white'/></svg>\") repeat-x",
              // For Webkit browsers (Safari, Chrome), use a separate property
              WebkitMask:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10 V20 H0 Z' fill='white'/></svg>\") repeat-x",
              maskSize: "120px 20px",
              WebkitMaskSize: "120px 20px",
              maskPosition: "0 0",
              WebkitMaskPosition: "0 0",
              position: "absolute",
              top: "-20px",
              left: 0,
              right: 0,
            }}
          />
          {/* Decorative line wave above, for accent */}
          <div
            className="wave-line animate-wave absolute top-[-22px] left-0 w-full h-full z-10"
            style={{
              height: "20px",
              background: "#32c2d9",
              mask: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/></svg>\") repeat-x",
              WebkitMask:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/></svg>\") repeat-x",
              maskSize: "120px 20px",
              WebkitMaskSize: "120px 20px",
              maskPosition: "0 0",
              WebkitMaskPosition: "0 0",
            }}
          />
          {/* boat image */}
          <Image
            src="/images/boat.svg"
            alt="Boat"
            width={160}
            height={160}
            className="absolute left-1/2 top-[-55px] w-40 h-40 hidden sm:block animate-boat-bob"
            draggable={false}
          />

          {/* Slogan/taglines below waves */}
          <div className="max-w-[1080px] mx-auto relative z-50 font-nunito font-black text-3xl">
            {/* Brand tagline 1 */}
            <h3>{t("tagline1")}</h3>
            {/* Brand tagline 2 */}
            <h3>{t("tagline2")}</h3>
          </div>
        </div>

        {/* Floating decorative fish image overlay, only on large screens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full lg:w-[1080px] justify-end items-center px-4 lg:px-0 hidden lg:flex">
          <Image
            src="/images/footerpkg.png"
            alt="Product Package"
            width={320}
            height={200}
            className="w-52 md:w-62 h-auto drop-shadow-[0_20px_18px_rgba(20,37,52,0.35)]"
          />
        </div>
      </section>
    </div>
  );
}
