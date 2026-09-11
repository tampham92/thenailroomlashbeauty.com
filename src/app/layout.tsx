import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Nails, Lashes & Brows in Sherwood Park`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  icons: { icon: "/favicon-192.png", apple: "/favicon-192.png" },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    title: site.name,
    description: site.description,
    images: [{ url: "/images/2026-02-1.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "/" },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: site.name,
  url: site.url,
  image: `${site.url}/images/logo.png`,
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  sameAs: [site.social.facebook, site.social.instagram],
  priceRange: "$$",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
      </body>
    </html>
  );
}
