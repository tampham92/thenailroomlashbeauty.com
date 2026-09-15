"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/content";

function Stars({ rating }: { rating: number }) {
  return (
    <p
      className="text-sm tracking-[0.2em] text-taupe"
      aria-label={`${rating} out of 5`}
    >
      {"★".repeat(rating)}
      <span className="text-taupe/40">{"★".repeat(5 - rating)}</span>
    </p>
  );
}

/**
 * Every testimonial is rendered into the HTML and the extras are only hidden,
 * so search engines still read the full set — slicing the array would keep them
 * out of the page source entirely.
 */
export default function TestimonialGrid({
  testimonials,
  initialCount = 9,
}: {
  testimonials: Testimonial[];
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, testimonials.length - initialCount);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={`${t.author}-${i}`}
            hidden={!expanded && i >= initialCount}
            className="flex h-full flex-col border border-beige bg-sand/50 p-8"
          >
            {t.rating ? <Stars rating={t.rating} /> : null}
            <span className="font-display text-5xl leading-none text-taupe">
              “
            </span>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 border-t border-beige pt-4">
              <span className="text-sm text-ink">{t.author}</span>
              {t.source || t.date ? (
                <span className="mt-1 block text-xs text-muted">
                  {[t.source, t.date].filter(Boolean).join(" · ")}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {hiddenCount > 0 && !expanded ? (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center justify-center border border-ink px-8 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-cream"
          >
            Show all {testimonials.length} reviews
          </button>
        </div>
      ) : null}
    </>
  );
}
