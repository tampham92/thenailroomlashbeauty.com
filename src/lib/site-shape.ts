/**
 * Shared between server and client — no `server-only` here, because the client
 * SiteProvider hands this same shape to Header, Footer and the booking button.
 */

export type SiteFile = {
  name: string;
  shortName: string;
  description: string;
  bookingUrl: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    mapUrl: string;
  };
  social: { facebook: string; instagram: string };
};

/** Deployment-level values; not editable from the admin. */
export const SITE_CONFIG = {
  url: "https://thenailroomlashbeauty.com",
  logo: "/images/logo.png",
} as const;

export type Site = SiteFile & {
  url: string;
  logo: string;
  phoneHref: string;
  address: SiteFile["address"] & { full: string };
};

/** Adds the values derived from what the admin edits. */
export function resolveSite(file: SiteFile): Site {
  const { street, city, region, postalCode } = file.address;
  return {
    ...file,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.logo,
    phoneHref: `tel:${file.phone.replace(/[^\d+]/g, "")}`,
    address: {
      ...file.address,
      full: [street, city, [region, postalCode].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", "),
    },
  };
}
