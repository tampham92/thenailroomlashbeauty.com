import {
  normalizeBanner,
  readGalleries,
  type Gallery,
  type GalleriesFile,
  type GalleryImage,
  type PageBanner,
} from "@/lib/content";

export type { Gallery, GalleryImage };

export function resolveGalleryBanner(file: GalleriesFile): PageBanner {
  return normalizeBanner(file.banner, {
    image: "/images/2026-02-IMG_6247.jpeg",
    eyebrow: "Our work",
    title: "Gallery",
    lead: "",
    textPlacement: "overlay",
  });
}

export async function getGalleryIndex(): Promise<{
  banner: PageBanner;
  galleries: Gallery[];
}> {
  const file = await readGalleries();
  return { banner: resolveGalleryBanner(file), galleries: file.galleries };
}

export async function getGalleries(): Promise<Gallery[]> {
  return (await readGalleries()).galleries;
}

export async function getGalleryBySlug(
  slug: string,
): Promise<Gallery | undefined> {
  return (await getGalleries()).find((g) => g.slug === slug);
}
