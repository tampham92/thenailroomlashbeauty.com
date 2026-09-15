"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  endSession,
  requireAuth,
  startSession,
} from "@/lib/auth";
import {
  readAbout,
  writeAbout,
  type AboutFile,
  type PageBanner,
  writeSite,
  readServices,
  writeServices,
  type TeamFile,
  writePolicy,
  type ServicesFile,
  type PolicyFile,
  type SiteFile,
  readHome,
  writeHome,
  type HomeFile,
  readGalleries,
  readTeam,
  readTestimonials,
  writeGalleries,
  writeTeam,
  writeTestimonials,
  type Gallery,
  type TeamMember,
  type Testimonial,
} from "@/lib/content";
import { deleteUploadIfUnused, saveUpload } from "@/lib/uploads";

export type ActionState = { error?: string; ok?: string };

/* ------------------------------------------------------------------ auth */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!password) return { error: "Enter the admin password." };

  let valid = false;
  try {
    valid = await checkPassword(password);
  } catch (error) {
    return { error: (error as Error).message };
  }

  if (!valid) return { error: "Incorrect password." };

  await startSession();
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/* --------------------------------------------------------------- helpers */

/** Public routes that render content from the JSON files. */
function revalidateSite(): void {
  revalidatePath("/", "layout");
}

function cleanBanner(banner: PageBanner): PageBanner {
  return {
    image: banner.image,
    eyebrow: (banner.eyebrow ?? "").trim(),
    title: banner.title.trim(),
    lead: (banner.lead ?? "").trim(),
    textPlacement: banner.textPlacement ?? "overlay",
  };
}

function validateBanner(banner: PageBanner | undefined): string | null {
  if (!banner?.image) return "The cover image is required.";
  if (!banner.title?.trim()) return "The page title is required.";
  return null;
}

function collectHomeImages(home: HomeFile): Set<string> {
  return new Set<string>([
    ...home.hero.slides,
    ...home.whyClientsLoveUs.images,
    home.ourStory.image,
    ...home.serviceHighlights.images.map((i) => i.src),
    ...home.groupEvents.images,
    home.barService.image,
  ]);
}

function collectGalleryImages(galleries: Gallery[]): Set<string> {
  const used = new Set<string>();
  for (const gallery of galleries) {
    used.add(gallery.cover);
    for (const image of gallery.images) used.add(image.src);
  }
  return used;
}

/* ------------------------------------------------------------- galleries */

export async function saveGalleryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const slug = String(formData.get("slug") ?? "");
  const payload = String(formData.get("payload") ?? "");

  let next: Pick<
    Gallery,
    "title" | "blurb" | "cover" | "images" | "textPlacement"
  >;
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  if (!next.title?.trim()) return { error: "Title is required." };
  if (!next.images?.length)
    return { error: "A gallery needs at least one image." };

  const file = await readGalleries();
  const index = file.galleries.findIndex((g) => g.slug === slug);
  if (index === -1) return { error: `Gallery "${slug}" no longer exists.` };

  const before = collectGalleryImages(file.galleries);

  file.galleries[index] = {
    ...file.galleries[index],
    title: next.title.trim(),
    blurb: next.blurb.trim(),
    cover: next.cover || next.images[0].src,
    textPlacement: next.textPlacement ?? "overlay",
    images: next.images.map((img) => ({
      src: img.src,
      alt: (img.alt ?? "").trim() || next.title.trim(),
    })),
  };

  await writeGalleries(file);

  const after = collectGalleryImages(file.galleries);
  for (const src of before) {
    if (!after.has(src)) await deleteUploadIfUnused(src, false);
  }

  revalidateSite();
  return { ok: `Saved “${file.galleries[index].title}”.` };
}

export async function saveGalleryBannerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  let next: PageBanner;
  try {
    next = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const bannerError = validateBanner(next);
  if (bannerError) return { error: bannerError };

  const file = await readGalleries();
  const previous = file.banner?.image;

  file.banner = cleanBanner(next);
  await writeGalleries(file);

  if (previous && previous !== file.banner.image) {
    await deleteUploadIfUnused(previous, false);
  }

  revalidateSite();
  return { ok: "Gallery banner saved." };
}

/* ------------------------------------------------------------------ home */

export async function saveHomeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = String(formData.get("payload") ?? "");

  let next: HomeFile;
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  if (!next.hero?.tagline?.trim()) return { error: "The hero tagline is required." };
  if (!next.hero.slides?.length)
    return { error: "The hero needs at least one slide image." };
  if (!next.ourStory?.image) return { error: "Our Story needs an image." };
  if (!next.barService?.image) return { error: "Full Bar Service needs an image." };

  const emptyGroup = next.serviceHighlights?.groups?.findIndex(
    (g) => !g.title?.trim(),
  );
  if (emptyGroup !== undefined && emptyGroup !== -1) {
    return { error: `Service group #${emptyGroup + 1} needs a title.` };
  }

  const before = await readHome();
  const usedBefore = collectHomeImages(before);

  const trimList = (list: string[]) =>
    list.map((x) => x.trim()).filter(Boolean);

  const cleaned: HomeFile = {
    hero: {
      slides: next.hero.slides,
      tagline: next.hero.tagline.trim(),
      intro: (next.hero.intro ?? "").trim(),
    },
    whyClientsLoveUs: {
      images: next.whyClientsLoveUs.images,
      items: next.whyClientsLoveUs.items
        .filter((i) => i.title?.trim() || i.body?.trim())
        .map((i) => ({ title: i.title.trim(), body: (i.body ?? "").trim() })),
    },
    ourStory: {
      image: next.ourStory.image,
      lead: (next.ourStory.lead ?? "").trim(),
      paragraphs: trimList(next.ourStory.paragraphs ?? []),
    },
    serviceHighlights: {
      images: next.serviceHighlights.images.map((i) => ({
        src: i.src,
        alt: (i.alt ?? "").trim(),
      })),
      groups: next.serviceHighlights.groups.map((g) => ({
        title: g.title.trim(),
        items: (g.items ?? [])
          .filter((i) => i.name?.trim() || i.body?.trim())
          .map((i) => ({ name: i.name.trim(), body: (i.body ?? "").trim() })),
      })),
    },
    groupEvents: {
      images: next.groupEvents.images,
      lead: (next.groupEvents.lead ?? "").trim(),
      occasions: trimList(next.groupEvents.occasions ?? []),
      perksIntro: (next.groupEvents.perksIntro ?? "").trim(),
      perks: trimList(next.groupEvents.perks ?? []),
    },
    barService: {
      image: next.barService.image,
      lead: (next.barService.lead ?? "").trim(),
      items: trimList(next.barService.items ?? []),
      outro: (next.barService.outro ?? "").trim(),
    },
  };

  await writeHome(cleaned);

  const usedAfter = collectHomeImages(cleaned);
  for (const src of usedBefore) {
    if (!usedAfter.has(src)) await deleteUploadIfUnused(src, false);
  }

  revalidateSite();
  return { ok: "Homepage saved." };
}

/* ------------------------------------------------------------------ team */

export async function saveTeamAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = String(formData.get("payload") ?? "");

  let next: { banner: PageBanner; members: TeamMember[] };
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const bannerError = validateBanner(next.banner);
  if (bannerError) return { error: bannerError };

  const missing = next.members.findIndex((m) => !m.name?.trim());
  if (missing !== -1) return { error: `Member #${missing + 1} needs a name.` };

  const file = await readTeam();
  const before = new Set(
    [file.banner?.image, file.hero, ...file.members.map((m) => m.photo)].filter(
      Boolean,
    ) as string[],
  );

  const cleaned: TeamFile = {
    banner: cleanBanner(next.banner),
    members: next.members.map((m) => ({
      name: m.name.trim(),
      role: (m.role ?? "").trim(),
      photo: m.photo,
      bio: (m.bio ?? "").trim(),
    })),
  };

  await writeTeam(cleaned);

  const after = new Set([
    cleaned.banner!.image,
    ...cleaned.members.map((m) => m.photo),
  ]);
  for (const src of before) {
    if (!after.has(src)) await deleteUploadIfUnused(src, false);
  }

  revalidateSite();
  return { ok: "Team saved." };
}

/* ----------------------------------------------------------------- about */

export async function saveAboutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = String(formData.get("payload") ?? "");

  let next: {
    banner: PageBanner;
    metaDescription: string;
    sideImage: string;
    sideImageAlt: string;
    paragraphs: string[];
  };
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const bannerError = validateBanner(next.banner);
  if (bannerError) return { error: bannerError };

  const paragraphs = (next.paragraphs ?? []).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return { error: "Add at least one paragraph." };

  const before = await readAbout();
  const beforeImages = [before.banner?.image, before.heroImage, before.sideImage];

  const cleaned: AboutFile = {
    banner: cleanBanner(next.banner),
    metaDescription: (next.metaDescription ?? "").trim(),
    sideImage: next.sideImage ?? "",
    sideImageAlt: (next.sideImageAlt ?? "").trim() || next.banner.title.trim(),
    paragraphs,
  };

  await writeAbout(cleaned);

  const afterImages = new Set([cleaned.banner!.image, cleaned.sideImage]);
  for (const src of beforeImages) {
    if (src && !afterImages.has(src)) await deleteUploadIfUnused(src, false);
  }

  revalidateSite();
  return { ok: "About page saved." };
}

/* -------------------------------------------------------------- settings */

export async function saveSiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = String(formData.get("payload") ?? "");

  let next: SiteFile;
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const required: [string, string | undefined][] = [
    ["Business name", next.name],
    ["Phone number", next.phone],
    ["Email", next.email],
    ["Booking URL", next.bookingUrl],
  ];
  for (const [label, value] of required) {
    if (!value?.trim()) return { error: `${label} is required.` };
  }

  if (!/^\S+@\S+\.\S+$/.test(next.email.trim())) {
    return { error: "That email address does not look valid." };
  }

  for (const [label, url] of [
    ["Booking URL", next.bookingUrl],
    ["Map link", next.address.mapUrl],
    ["Facebook URL", next.social.facebook],
    ["Instagram URL", next.social.instagram],
  ] as const) {
    if (!url?.trim()) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("bad protocol");
      }
    } catch {
      return { error: `${label} must be a full URL starting with https://` };
    }
  }

  if (!next.phone.replace(/[^\d]/g, "")) {
    return { error: "Phone number needs at least one digit." };
  }

  await writeSite({
    name: next.name.trim(),
    shortName: (next.shortName || next.name).trim(),
    description: (next.description ?? "").trim(),
    bookingUrl: next.bookingUrl.trim(),
    phone: next.phone.trim(),
    email: next.email.trim(),
    address: {
      street: (next.address.street ?? "").trim(),
      city: (next.address.city ?? "").trim(),
      region: (next.address.region ?? "").trim(),
      postalCode: (next.address.postalCode ?? "").trim(),
      country: (next.address.country ?? "").trim(),
      mapUrl: (next.address.mapUrl ?? "").trim(),
    },
    social: {
      facebook: (next.social.facebook ?? "").trim(),
      instagram: (next.social.instagram ?? "").trim(),
    },
  });

  revalidateSite();
  return { ok: "Business details saved." };
}

/* -------------------------------------------------------------- services */

export async function saveServicesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = String(formData.get("payload") ?? "");

  let next: ServicesFile;
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const servicesBannerError = validateBanner(next.banner);
  if (servicesBannerError) return { error: servicesBannerError };

  const ids = new Set<string>();
  for (const [index, category] of next.categories.entries()) {
    if (!category.title?.trim()) {
      return { error: `Category #${index + 1} needs a title.` };
    }
    const id = (category.id || category.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!id) return { error: `Category #${index + 1} needs a usable title.` };
    if (ids.has(id)) {
      return { error: `Two categories resolve to the same anchor "${id}".` };
    }
    ids.add(id);
    category.id = id;

    const unnamed = category.items.findIndex((i) => !i.name?.trim());
    if (unnamed !== -1) {
      return {
        error: `"${category.title}" service #${unnamed + 1} needs a name.`,
      };
    }
  }

  const previousServices = await readServices();

  await writeServices({
    banner: cleanBanner(next.banner!),
    categories: next.categories.map((c) => ({
      id: c.id,
      title: c.title.trim(),
      items: c.items.map((i) => ({
        name: i.name.trim(),
        ...(i.price?.trim() ? { price: i.price.trim() } : {}),
        ...(i.duration?.trim() ? { duration: i.duration.trim() } : {}),
        ...(i.subtitle?.trim() ? { subtitle: i.subtitle.trim() } : {}),
        ...(i.headline?.trim() ? { headline: i.headline.trim() } : {}),
        body: (i.body ?? []).map((b) => b.trim()).filter(Boolean),
      })),
    })),
  });

  if (
    previousServices.banner?.image &&
    previousServices.banner.image !== next.banner!.image
  ) {
    await deleteUploadIfUnused(previousServices.banner.image, false);
  }

  revalidateSite();
  return { ok: "Services saved." };
}

/* ---------------------------------------------------------------- policy */

export async function savePolicyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = String(formData.get("payload") ?? "");

  let next: PolicyFile;
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const incomplete = next.policies.findIndex(
    (p) => !p.title?.trim() || !p.body?.trim(),
  );
  if (incomplete !== -1) {
    return { error: `Policy #${incomplete + 1} needs a title and a body.` };
  }

  await writePolicy({
    intro: (next.intro ?? "").trim(),
    policies: next.policies.map((p) => ({
      title: p.title.trim(),
      body: p.body.trim(),
    })),
    outro: (next.outro ?? "").trim(),
  });

  revalidateSite();
  return { ok: `Saved ${next.policies.length} policies.` };
}

/* ---------------------------------------------------------- testimonials */

export async function saveTestimonialsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = String(formData.get("payload") ?? "");

  let next: Testimonial[];
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const incomplete = next.findIndex(
    (t) => !t.quote?.trim() || !t.author?.trim(),
  );
  if (incomplete !== -1) {
    return { error: `Testimonial #${incomplete + 1} needs a quote and a name.` };
  }

  const file = await readTestimonials();
  file.testimonials = next.map((t) => ({
    quote: t.quote.trim(),
    author: t.author.trim(),
    ...(t.source?.trim() ? { source: t.source.trim() } : {}),
    ...(t.rating && t.rating >= 1 && t.rating <= 5
      ? { rating: Math.round(t.rating) }
      : {}),
    ...(t.date?.trim() ? { date: t.date.trim() } : {}),
  }));

  await writeTestimonials(file);
  revalidateSite();
  return { ok: `Saved ${file.testimonials.length} testimonial(s).` };
}

/* ---------------------------------------------------------------- upload */

export type UploadState = { error?: string; src?: string; token?: string };

export async function uploadAction(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await requireAuth();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file received." };

  const result = await saveUpload(file);
  if (!result.ok) return { error: result.error };

  // Token lets the client distinguish consecutive uploads of the same file.
  return { src: result.src, token: crypto.randomUUID() };
}
