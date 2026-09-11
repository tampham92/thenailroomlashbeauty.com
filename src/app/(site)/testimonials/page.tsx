import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBanner from "@/components/CtaBanner";
import { site } from "@/data/site";
import { getTestimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "What clients say about The Nail Room Lash & Beauty in Sherwood Park.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <PageHero
        eyebrow="In their words"
        title="Testimonials"
        lead="Kind words from the clients who make our studio what it is."
      />

      <Section tone="cream" size="md">
        {testimonials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.author + t.quote.slice(0, 16)}
                className="flex h-full flex-col border border-beige bg-sand/50 p-8"
              >
                <span className="font-display text-5xl leading-none text-taupe">
                  “
                </span>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-beige pt-4">
                  <span className="text-sm text-ink">{t.author}</span>
                  {t.source ? (
                    <span className="ml-2 text-xs text-muted">{t.source}</span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
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
              <a
                href={site.address.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-ink px-8 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-cream"
              >
                Review on Google
              </a>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] text-muted underline underline-offset-8 transition-colors hover:text-ink"
              >
                Review on Facebook
              </a>
            </div>
          </div>
        )}
      </Section>

      <CtaBanner />
    </>
  );
}
