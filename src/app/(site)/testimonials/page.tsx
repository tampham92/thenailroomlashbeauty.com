import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBanner from "@/components/CtaBanner";
import BookNowButton from "@/components/BookNowButton";
import TestimonialGrid from "@/components/TestimonialGrid";
import { getSite } from "@/data/site";
import { getTestimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "What clients say about The Nail Room Lash & Beauty in Sherwood Park.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const [testimonials, site] = await Promise.all([getTestimonials(), getSite()]);

  return (
    <>
      <PageHero
        eyebrow="In their words"
        title="Testimonials"
        lead="Kind words from the clients who make our studio what it is."
      />

      <Section tone="cream" size="md">
        {testimonials.length > 0 ? (
          <TestimonialGrid testimonials={testimonials} />
        ) : (
          <div className="mx-auto max-w-2xl border border-beige bg-sand/50 p-10 text-center sm:p-14">
            <span className="font-display text-5xl leading-none text-taupe">
              “
            </span>
            <p className="mt-4 text-lg leading-relaxed text-ink sm:text-xl">
              We’re collecting reviews from our clients.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Have you visited The Nail Room? We’d love to hear about your
              experience — leave us a review on Google or Facebook, or send us a
              note.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <BookNowButton />
            </div>

            <p className="mt-8 text-xs text-muted">
              Already visited?{" "}
              <a
                href={site.address.mapUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="underline underline-offset-4 hover:text-ink"
              >
                Leave a review on Google
              </a>{" "}
              or{" "}
              <a
                href={site.social.facebook}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="underline underline-offset-4 hover:text-ink"
              >
                on Facebook
              </a>
              .
            </p>
          </div>
        )}
      </Section>

      <CtaBanner />
    </>
  );
}
