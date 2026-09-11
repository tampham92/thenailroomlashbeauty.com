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

  let next: Pick<Gallery, "title" | "blurb" | "cover" | "images">;
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

  let next: { hero: string; members: TeamMember[] };
  try {
    next = JSON.parse(payload);
  } catch {
    return { error: "Could not read the submitted data." };
  }

  const missing = next.members.findIndex((m) => !m.name?.trim());
  if (missing !== -1) return { error: `Member #${missing + 1} needs a name.` };

  const file = await readTeam();
  const before = new Set([file.hero, ...file.members.map((m) => m.photo)]);

  const cleaned = {
    hero: next.hero || file.hero,
    members: next.members.map((m) => ({
      name: m.name.trim(),
      role: (m.role ?? "").trim(),
      photo: m.photo,
      bio: (m.bio ?? "").trim(),
    })),
  };

  await writeTeam(cleaned);

  const after = new Set([cleaned.hero, ...cleaned.members.map((m) => m.photo)]);
  for (const src of before) {
    if (!after.has(src)) await deleteUploadIfUnused(src, false);
  }

  revalidateSite();
  return { ok: "Team saved." };
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
