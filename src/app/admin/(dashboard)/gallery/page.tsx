import Image from "next/image";
import Link from "next/link";
import { readGalleries } from "@/lib/content";
import { resolveGalleryBanner } from "@/data/galleries";
import GalleryBannerEditor from "./GalleryBannerEditor";

export default async function AdminGalleryList() {
  const file = await readGalleries();
  const banner = resolveGalleryBanner(file);

  return (
    <>
      <h1 className="font-display text-3xl text-ink">Gallery</h1>
      <p className="mt-2 text-sm text-neutral-500">
        The banner below belongs to the gallery index. Pick a gallery to manage
        its photos.
      </p>

      <GalleryBannerEditor banner={banner} />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {file.galleries.map((gallery) => (
          <Link
            key={gallery.slug}
            href={`/admin/gallery/${gallery.slug}`}
            className="group block border border-neutral-200 transition-colors hover:border-ink"
          >
            <div className="relative aspect-[4/3] bg-neutral-100">
              <Image
                src={gallery.cover}
                alt={gallery.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl text-ink">{gallery.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">
                {gallery.images.length} images
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
