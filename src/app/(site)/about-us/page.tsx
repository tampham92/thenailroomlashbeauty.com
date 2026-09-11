import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The Nail Room Lash & Beauty was created to make every client feel cared for, confident, and comfortable from the moment they walk in.",
  alternates: { canonical: "/about-us" },
};

const paragraphs = [
  "The Nail Room Lash & Beauty was created with one simple goal in mind: to make every client feel cared for, confident, and comfortable from the moment they walk in. We believe luxury should feel inviting, not intimidating — and that true beauty comes from thoughtful service and genuine connection.",
  "From everyday self-care to special celebrations, we take pride in offering personalized experiences tailored to each client’s needs. Whether you’re enjoying a relaxing pedicure, a detailed nail set, or a full beauty transformation, our focus is always on quality, comfort, and attention to detail.",
  "At The Nail Room, it’s not just about beautiful results — it’s about how you feel during and after your visit. Relaxed. Valued. And excited to come back.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Sherwood Park, Alberta"
        title="About Us"
        image="/images/2026-03-IMG_6550-scaled.jpeg"
      />

      <Section tone="cream" size="md">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-sm leading-relaxed text-muted sm:text-base">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-beige">
            <Image
              src="/images/2026-02-IMG_6247-scaled.jpeg"
              alt="Inside The Nail Room Lash & Beauty"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
