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

export type ServicesFile = { categories: ServiceCategory[] };

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

export type GalleriesFile = { galleries: Gallery[] };
export type TeamFile = { hero: string; members: TeamMember[] };
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
