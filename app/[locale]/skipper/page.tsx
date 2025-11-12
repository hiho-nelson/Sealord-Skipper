import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SkipperForm from "@/components/SkipperForm";
import Image from "next/image";

export default async function SkipperPage() {
  const t = await getTranslations("SkipperPage");

  return (
    <div className="min-h-screen bg-[#f0ecec]">
      {/* Header with Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <section className="relative text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-[800px] flex items-end bg-[#252f62]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 max-w-[1600px] mx-auto">
          <Image
            src="/images/bb3.jpg"
            alt="Skipper Banner"
            fill
            className="object-contain"
            priority
            sizes="100vw"
          />
        </div>

        <div className="relative z-10 max-w-[1080px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
            {/* Left: Brand Name and Tagline */}
            <div className="flex-2 text-center lg:text-left">
              <p className="text-xl md:text-5xl mb-2 drop-shadow-md">
                {t("tagline1")}
              </p>
              <p className="text-xl md:text-5xl drop-shadow-md">
                {t("tagline2")}
              </p>
            </div>

            {/* Right: Product Images */}
            <div className="flex-1 flex gap-4 justify-center lg:justify-end">
              <div className="w-48 h-64 bg-white rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=600&fit=crop"
                  alt="Skipper Dog Food"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 192px, 192px"
                />
              </div>
              <div className="w-48 h-64 bg-white rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=600&fit=crop"
                  alt="Skipper Cat Food"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 192px, 192px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction & Form Section */}
      <section className="bg-gray-50 pt-16 pb-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Introduction */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("heroTitle")}
              </h2>
              <p className="text-lg text-gray-700 mb-4">{t("intro1")}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Feature 1 */}
            <div className="p-6 text-white bg-[#d19d51]">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-bold text-lg mb-2">{t("feature1Title")}</h3>
              <p className="text-sm">{t("feature1Desc")}</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 text-white bg-[#009ba4]">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="font-bold text-lg mb-2">{t("feature2Title")}</h3>
              <p className="text-sm">{t("feature2Desc")}</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 text-white bg-[#ffd35f]">
              <div className="text-4xl mb-4">⬇️</div>
              <h3 className="font-bold text-lg mb-2">{t("feature3Title")}</h3>
              <p className="text-sm">{t("feature3Desc")}</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 text-white bg-[#c76aa7]">
              <div className="text-4xl mb-4">🐟</div>
              <h3 className="font-bold text-lg mb-2">{t("feature4Title")}</h3>
              <p className="text-sm">{t("feature4Desc")}</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 text-white bg-[#95d0c7]">
              <div className="text-4xl mb-4">🐠</div>
              <h3 className="font-bold text-lg mb-2">{t("feature5Title")}</h3>
              <p className="text-sm">{t("feature5Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-[#3ebac8] relative w-full">
        {/* Upper Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1080px] py-16 mx-auto">
            <div className="max-w-[400px] flex flex-col gap-2">
              <h3 className="text-xl font-bold">
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
        <div className="bg-[#202c4f] py-16 text-white relative px-4 sm:px-6 lg:px-8">
          {/* Decorative filled wave using SVG mask */}
          <div
            className="wave-fill absolute top-0 left-0 w-full h-full z-10"
            style={{
              height: "60px",
              background: "#1c2a54",
              // Use SVG as a repeating mask for the wave effect (for browsers supporting mask)
              mask: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10 V20 H0 Z' fill='white'/></svg>\") repeat-x",
              // For Webkit browsers (Safari, Chrome), use a separate property
              WebkitMask:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10 V20 H0 Z' fill='white'/></svg>\") repeat-x",
              maskSize: "120px 20px",
              WebkitMaskSize: "120px 20px",
              position: "absolute",
              top: "-20px",
              left: 0,
              right: 0,
            }}
          />
          {/* Decorative line wave above, for accent */}
          <div
            className="wave-line absolute top-[-22px] left-0 w-full h-full z-10"
            style={{
              height: "20px",
              background: "#3ebac8",
              mask: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10' fill='none' stroke='white' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>\") repeat-x",
              WebkitMask:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10' fill='none' stroke='white' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>\") repeat-x",
              maskSize: "120px 20px",
              WebkitMaskSize: "120px 20px",
            }}
          />
          {/* Decorative dark round shape overlapping waves */}
          <div className="absolute left-1/2 top-[-40px] -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#202c4f]" />

          {/* Slogan/taglines below waves */}
          <div className="max-w-[1080px] mx-auto">
            {/* Brand tagline 1 */}
            <h3 className="text-3xl font-bold">{t("tagline1")}</h3>
            {/* Brand tagline 2 */}
            <h3 className="text-3xl font-bold">{t("tagline2")}</h3>
          </div>
        </div>

        {/* Floating decorative fish image overlay, only on large screens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full lg:w-[1080px] justify-end items-center px-4 lg:px-0 hidden lg:flex">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Skipper fish"
            width={320}
            height={200}
            style={{ objectFit: "cover" }}
            className="w-52 md:w-60 h-[350px]"
            priority
          />
        </div>
      </section>
    </div>
  );
}
