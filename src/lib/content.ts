import "server-only";

import type { SiteFile as SiteFileType } from "./site-shape";

import { promises as fs } from "node:fs";
import path from "node:path";

import { CONTENT_DIR } from "./paths";

export type { SiteFile } from "./site-shape";

export type ServiceItem = {
  name: string;
  price?: string;
  duration?: string;
  subtitle?: string;
  headline?: string;
  body: string[];
};

export type ServiceCategory = {
  id: string;
  title: string;
  items: ServiceItem[];
};

export type ServicesFile = {
  banner?: PageBanner;
  categories: ServiceCategory[];
};

/**
 * The banner at the top of a page: the cover image plus the text drawn over it.
 *
 * `overlayText: false` is for covers that already have wording composed into
 * the artwork — the heading is still rendered for search engines and screen
 * readers, just not painted on top of the picture.
 */
export type BannerTextPlacement = "overlay" | "below" | "hidden";

export type PageBanner = {
  image: string;
  eyebrow: string;
  title: string;
  lead: string;
  textPlacement: BannerTextPlacement;
  /** Legacy flag, still read from files written before textPlacement. */
  overlayText?: boolean;
};

/**
 * Content files are seeded once and then owned by the admin, so a file written
 * by an older release never gains new fields. Every banner is read through
 * this, which fills in whatever is missing.
 */
export function normalizeBanner(
  raw: Partial<PageBanner> | undefined,
  fallback: PageBanner,
): PageBanner {
  const placement: BannerTextPlacement =
    raw?.textPlacement ??
    (raw?.overlayText === false ? "below" : undefined) ??
    fallback.textPlacement;

  return {
    image: raw?.image ?? fallback.image,
    eyebrow: raw?.eyebrow ?? fallback.eyebrow,
    title: raw?.title ?? fallback.title,
    lead: raw?.lead ?? fallback.lead,
    textPlacement: placement,
  };
}

export type AboutFile = {
  /** Legacy flat fields; still read when `banner` is absent. */
  eyebrow?: string;
  title?: string;
  heroImage?: string;
  banner?: PageBanner;
  metaDescription: string;
  sideImage: string;
  sideImageAlt: string;
  paragraphs: string[];
};

export type PolicyItem = { title: string; body: string };

export type PolicyFile = {
  intro: string;
  policies: PolicyItem[];
  outro: string;
};

export type GalleryImage = { src: string; alt: string };

export type Gallery = {
  slug: string;
  title: string;
  blurb: string;
  cover: string;
  /** Where the title sits relative to the cover. Defaults to "overlay". */
  textPlacement?: BannerTextPlacement;
  overlayText?: boolean;
  images: GalleryImage[];
};

export type TeamMember = {
  name: string;
  role: string;
  photo: string;
  bio: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  source?: string;
  /** 1–5, optional. Displayed only — see the note in the testimonials page. */
  rating?: number;
  /** Free text, e.g. "March 2026". Optional. */
  date?: string;
};

export type HomeFile = {
  hero: { slides: string[]; tagline: string; intro: string };
  whyClientsLoveUs: {
    images: string[];
    items: { title: string; body: string }[];
  };
  ourStory: { image: string; lead: string; paragraphs: string[] };
  serviceHighlights: {
    images: GalleryImage[];
    groups: { title: string; items: { name: string; body: string }[] }[];
  };
  groupEvents: {
    images: string[];
    lead: string;
    occasions: string[];
    perksIntro: string;
    perks: string[];
  };
  barService: {
    image: string;
    lead: string;
    items: string[];
    outro: string;
  };
};

export type GalleriesFile = {
  banner?: PageBanner;
  galleries: Gallery[];
};
export type TeamFile = {
  /** Legacy: the banner image path on its own. */
  hero?: string;
  banner?: PageBanner;
  members: TeamMember[];
};
export type TestimonialsFile = { testimonials: Testimonial[] };

async function readJson<T>(name: string): Promise<T> {
  const raw = await fs.readFile(path.join(CONTENT_DIR, `${name}.json`), "utf8");
  return JSON.parse(raw) as T;
}

/**
 * Writes atomically: a partial write would otherwise leave the site with an
 * unparseable content file.
 */
async function writeJson(name: string, data: unknown): Promise<void> {
  const target = path.join(CONTENT_DIR, `${name}.json`);
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  await fs.rename(tmp, target);
}

export const readAbout = () => readJson<AboutFile>("about");
export const writeAbout = (data: AboutFile) => writeJson("about", data);

export const readSite = () => readJson<SiteFileType>("site");
export const writeSite = (data: SiteFileType) => writeJson("site", data);

export const readServices = () => readJson<ServicesFile>("services");
export const writeServices = (data: ServicesFile) => writeJson("services", data);

export const readPolicy = () => readJson<PolicyFile>("policy");
export const writePolicy = (data: PolicyFile) => writeJson("policy", data);

export const readHome = () => readJson<HomeFile>("home");
export const writeHome = (data: HomeFile) => writeJson("home", data);

export const readGalleries = () => readJson<GalleriesFile>("galleries");
export const writeGalleries = (data: GalleriesFile) =>
  writeJson("galleries", data);

export const readTeam = () => readJson<TeamFile>("team");
export const writeTeam = (data: TeamFile) => writeJson("team", data);

export const readTestimonials = () => readJson<TestimonialsFile>("testimonials");
export const writeTestimonials = (data: TestimonialsFile) =>
  writeJson("testimonials", data);
