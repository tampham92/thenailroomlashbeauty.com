import Image from "next/image";
import type { BannerTextPlacement, PageBanner } from "@/lib/content";

type Props = Partial<PageBanner> & { title: string };

function TextBlock({
  eyebrow,
  title,
  lead,
  tone,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  tone: "light" | "dark";
}) {
  const light = tone === "light";
  return (
    <div className="container-tnr text-center">
      {eyebrow ? (
        <p className={`eyebrow mb-4 ${light ? "text-cream/75" : ""}`}>
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`text-4xl tracking-wide sm:text-5xl ${
          light ? "text-cream lg:text-6xl" : ""
        }`}
      >
        {title}
      </h1>
      {lead ? (
        <p
          className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed ${
            light ? "text-cream/85" : "text-muted"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The covers are designed at 3:2 with wording composed into the artwork, so the
 * banner keeps that ratio rather than cropping to a fixed height.
 *
 * `textPlacement` exists because those covers already carry their own words:
 * painting the page title over them reads as clutter, but dropping it entirely
 * would cost the page its <h1>. "below" keeps the heading visible and out of
 * the way; "hidden" keeps it for search engines and screen readers only.
 */
export default function PageHero({
  image,
  eyebrow,
  title,
  lead,
  textPlacement = "overlay",
}: Props) {
  if (!image) {
    return (
      <section className="bg-sand">
        <div className="py-16 sm:py-24">
          <TextBlock eyebrow={eyebrow} title={title} lead={lead} tone="dark" />
        </div>
      </section>
    );
  }

  const placement: BannerTextPlacement = textPlacement;

  return (
    <section className="w-full">
      <div className="relative isolate aspect-[3/2] w-full overflow-hidden">
        <Image
          src={image}
          alt={placement === "overlay" ? "" : title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {placement === "overlay" ? (
          <>
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center">
              <TextBlock
                eyebrow={eyebrow}
                title={title}
                lead={lead}
                tone="light"
              />
            </div>
          </>
        ) : null}
      </div>

      {placement === "below" ? (
        <div className="bg-sand py-12 sm:py-16">
          <TextBlock eyebrow={eyebrow} title={title} lead={lead} tone="dark" />
        </div>
      ) : null}

      {placement === "hidden" ? <h1 className="sr-only">{title}</h1> : null}
    </section>
  );
}
