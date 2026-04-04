import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeTitle from "@/components/HomeTitle";
import UrlShortForm from "@/features/short_links/components/UrlShortForm";
import UtmInfoSmall from "@/components/UtmInfoSmall";
import SubscriptionUpgrade from "@/components/SubscriptionUpgrade";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Head");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "/",
      images: ["/og-image.png"],
    },
    twitter: {
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function HomePage() {
  const hasPlan = true;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://iny.one/#website",
        url: "https://iny.one",
        name: "iny.one",
        alternateName: "iny.one URL Shortener",
        description:
          "Free URL shortener with UTM tracking to create short links and measure marketing performance.",
        inLanguage: ["en", "es"],
      },
      {
        "@type": "Organization",
        "@id": "https://iny.one/#organization",
        name: "iny.one",
        url: "https://iny.one",
        logo: {
          "@type": "ImageObject",
          url: "https://iny.one/apple-touch-icon.png",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://iny.one/#software",
        name: "iny.one",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: "https://iny.one",
        description:
          "Web-based URL shortener with UTM parameter support for cleaner links and campaign tracking.",
        featureList: [
          "URL shortening",
          "UTM parameter builder",
          "Link tracking",
          "Campaign analytics",
          "One-click copy",
        ],
        screenshot: "https://iny.one/og-image.png",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: {
          "@id": "https://iny.one/#organization",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-2xl mx-auto">
        <HomeTitle />
        <UrlShortForm />
        <UtmInfoSmall />
      </div>
      <SubscriptionUpgrade hidden={hasPlan} />
    </>
  );
}
