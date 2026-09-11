import { readGalleries, type Gallery, type GalleryImage } from "@/lib/content";

export type { Gallery, GalleryImage };

export async function getGalleries(): Promise<Gallery[]> {
  const { galleries } = await readGalleries();
  return galleries;
}

export async function getGalleryBySlug(
  slug: string,
): Promise<Gallery | undefined> {
  const galleries = await getGalleries();
  return galleries.find((g) => g.slug === slug);
}
