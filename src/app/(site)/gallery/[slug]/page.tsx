import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import GalleryGrid from "@/components/GalleryGrid";
import CtaBanner from "@/components/CtaBanner";
import { getGalleries, getGalleryBySlug } from "@/data/galleries";

export async function generateStaticParams() {
  const galleries = await getGalleries();
  return galleries.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) return {};

  return {
    title: `${gallery.title} Gallery`,
    description: gallery.blurb,
    alternates: { canonical: `/gallery/${gallery.slug}` },
  };
}

export default async function GalleryDetailPage({
  params,
}: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  const allGalleries = await getGalleries();
  const others = allGalleries.filter((g) => g.slug !== gallery.slug);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={gallery.title}
        lead={gallery.blurb}
        image={gallery.cover}
        textPlacement={gallery.textPlacement ?? "overlay"}
      />

      <Section tone="cream" size="md">
        <GalleryGrid images={gallery.images} />
      </Section>

      <Section tone="sand" size="sm">
        <p className="eyebrow text-center">More galleries</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {others.map((g) => (
            <Link
              key={g.slug}
              href={`/gallery/${g.slug}`}
              className="text-sm uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
            >
              {g.title}
            </Link>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
