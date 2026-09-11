export const site = {
  name: "The Nail Room Lash & Beauty",
  shortName: "The Nail Room",
  url: "https://thenailroomlashbeauty.com",
  description:
    "Luxury nail, lash and brow studio in Sherwood Park — manicures, nail extensions, pedicures, lashes, brows, group events and a full bar.",
  logo: "/images/logo.png",
  bookingUrl:
    "https://www.fresha.com/book-now/the-nail-room-lash-beauty-pxfnb7hf/all-offer?share=true&pId=2727040",
  phone: "+1 (780) 695-3007",
  phoneHref: "tel:+17806953007",
  email: "thenailroom.lash.beauty@gmail.com",
  address: {
    street: "#20, 975 Broadmoor Boulevard",
    city: "Sherwood Park",
    region: "Alberta",
    postalCode: "T8A 5W9",
    country: "CA",
    full: "#20, 975 Broadmoor Boulevard, Sherwood Park, Alberta T8A 5W9",
    mapUrl: "https://maps.app.goo.gl/kREWpg6C7ELwWUxQ9",
  },
  social: {
    facebook:
      "https://www.facebook.com/people/The-Nail-Room-Lash-Beauty/61582865512662/",
    instagram:
      "https://www.instagram.com/thenailroom_sherwoodpark?igsh=amVjZ2FobWY4N2ty&utm_source=qr",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "Meet our team", href: "/meet-our-team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact-us" },
] as const;
