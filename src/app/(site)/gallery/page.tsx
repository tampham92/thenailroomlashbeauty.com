import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBanner from "@/components/CtaBanner";
import { getGalleryIndex } from "@/data/galleries";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse our work — nails, pedicures, brows and lashes, our space, private events and bar service.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryIndexPage() {
  const { banner, galleries } = await getGalleryIndex();

  return (
    <>
      <PageHero {...banner} />

      <Section tone="cream" size="md">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => (
            <Link
              key={g.slug}
              href={`/gallery/${g.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-beige">
                <Image
                  src={g.cover}
                  alt={g.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-ink/10 transition-colors duration-300 group-hover:bg-ink/25" />
              </div>
              <h2 className="mt-5 text-2xl transition-colors group-hover:text-graphite">
                {g.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {g.blurb}
              </p>
              <span className="mt-4 inline-block text-[0.7rem] uppercase tracking-[0.18em] text-taupe">
                View gallery →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
