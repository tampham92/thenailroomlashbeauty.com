/**
 * Kept in code on purpose: these mirror the app's routes, so editing them from
 * the admin could only ever produce broken links.
 */
export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "Meet our team", href: "/meet-our-team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact-us" },
] as const;
