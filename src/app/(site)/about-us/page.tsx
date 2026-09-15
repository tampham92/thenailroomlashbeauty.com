import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBanner from "@/components/CtaBanner";
import { getAbout } from "@/data/about";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return {
    title: about.banner.title,
    description: about.metaDescription,
    alternates: { canonical: "/about-us" },
  };
}

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <>
      <PageHero {...about.banner} />

      <Section tone="cream" size="md">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-sm leading-relaxed text-muted sm:text-base">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {about.sideImage ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-beige">
              <Image
                src={about.sideImage}
                alt={about.sideImageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
