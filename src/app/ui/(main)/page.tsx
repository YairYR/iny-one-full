import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeTitle from "@/components/HomeTitle";
import UrlShortForm from "@/features/short_links/components/UrlShortForm";
import UtmInfoSmall from "@/components/UtmInfoSmall";
import SubscriptionUpgrade from "@/components/SubscriptionUpgrade";
import HomeContent from "@/components/HomeContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Head");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: "https://iny.one",
      languages: {
        en: "https://iny.one",
        es: "https://iny.one",
        "x-default": "https://iny.one",
      },
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
          "QR code generator",
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
      {
        "@type": "HowTo",
        name: "How to shorten a URL with UTM tracking",
        description:
          "Create a free short link with UTM parameters and a QR code in three steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Paste your long URL",
            text: "Paste the long URL you want to share into the shortener field.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Add UTM parameters",
            text: "Optionally add UTM parameters (source, medium, campaign) to tag the link for analytics.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Copy or download",
            text: "Copy your short link, or download its QR code, and share it anywhere.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is iny.one free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The core service — URL shortening, UTM parameters, and QR codes — is free and requires no signup for basic use.",
            },
          },
          {
            "@type": "Question",
            name: "Does iny.one add an ad page before redirecting?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. iny.one redirects visitors straight to the destination with no advertising interstitial.",
            },
          },
          {
            "@type": "Question",
            name: "Does iny.one generate QR codes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Every short link can be turned into a downloadable QR code (PNG) at no cost.",
            },
          },
        ],
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
      <HomeContent />
      <SubscriptionUpgrade hidden={hasPlan} />
    </>
  );
}
