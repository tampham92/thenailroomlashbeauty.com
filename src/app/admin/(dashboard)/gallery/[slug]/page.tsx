import Link from "next/link";
import { notFound } from "next/navigation";
import { readGalleries } from "@/lib/content";
import GalleryEditor from "./GalleryEditor";

export default async function AdminGalleryEdit({
  params,
}: PageProps<"/admin/gallery/[slug]">) {
  const { slug } = await params;
  const { galleries } = await readGalleries();
  const gallery = galleries.find((g) => g.slug === slug);
  if (!gallery) notFound();

  return (
    <>
      <Link
        href="/admin/gallery"
        className="text-xs uppercase tracking-widest text-neutral-400 hover:text-ink"
      >
        ← All galleries
      </Link>
      <GalleryEditor gallery={gallery} />
    </>
  );
}
