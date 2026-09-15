import Image from "next/image";
import HeroSlider from "@/components/HeroSlider";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import BookNowButton from "@/components/BookNowButton";
import CtaBanner from "@/components/CtaBanner";
import { getHome } from "@/data/home";
import { getTestimonials } from "@/data/testimonials";
import TestimonialGrid from "@/components/TestimonialGrid";
import Link from "next/link";

export default async function HomePage() {
  const {
    hero,
    barService,
    groupEvents,
    ourStory,
    serviceHighlights,
    whyClientsLoveUs,
  } = await getHome();

  const testimonials = await getTestimonials();

  return (
    <>
      <HeroSlider hero={hero} />

      <Section tone="sand" size="sm">
        <div className="text-center">
          <h2 className="text-3xl tracking-[0.06em] sm:text-4xl">
            The Nail Room Lash &amp; Beauty
          </h2>
        </div>
      </Section>

      {/* WHY CLIENTS LOVE US */}
      <Section id="why-us" tone="cream" size="md">
        <SectionHeading eyebrow="The Nail Room" title="Why clients love us" />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <ul className="space-y-8">
            {whyClientsLoveUs.items.map((item) => (
              <li key={item.title} className="border-l border-taupe/50 pl-5">
                <h3 className="text-xl sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:sticky lg:top-28">
            {whyClientsLoveUs.images.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden bg-beige ${
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* OUR STORY */}
      <Section tone="sand" size="md">
        <SectionHeading
          eyebrow="Our story"
          title={ourStory.lead}
          align="center"
        />
        <div className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-sm leading-relaxed text-muted sm:text-base">
          {ourStory.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <div className="relative mt-12 aspect-[21/9] w-full overflow-hidden bg-beige">
          <Image
            src={ourStory.image}
            alt="Inside The Nail Room Lash & Beauty"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Section>

      {/* OUR SERVICES */}
      <Section id="services" tone="cream" size="md">
        <SectionHeading
          eyebrow="What we offer"
          title="Our services"
          lead="Nails, lashes and brows under one elegant roof — making self-care effortless."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {serviceHighlights.images.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[4/5] overflow-hidden bg-beige"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          {serviceHighlights.groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-2xl sm:text-3xl">{group.title}</h3>
              <span className="mt-4 block h-px w-12 bg-taupe" />
              <dl className="mt-7 space-y-6">
                {group.items.map((item) => (
                  <div key={item.name}>
                    <dt className="text-[0.78rem] uppercase tracking-[0.16em] text-ink">
                      {item.name}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center justify-center border border-ink px-8 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-cream"
          >
            View full service menu
          </Link>
        </div>
      </Section>

      {/* GROUP CELEBRATIONS */}
      <Section id="events" tone="beige" size="md">
        <SectionHeading
          eyebrow="Celebrate with us"
          title="Group celebrations & private events"
          lead={groupEvents.lead}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-2 gap-4">
            {groupEvents.images.map((src) => (
              <div
                key={src}
                className="relative aspect-[4/5] overflow-hidden bg-sand"
              >
                <Image
                  src={src}
                  alt="Group celebration at The Nail Room"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-ink">
              Our spacious studio is ideal for hosting
            </p>
            <ul className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-2">
              {groupEvents.occasions.map((o) => (
                <li key={o} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-taupe" />
                  {o}
                </li>
              ))}
            </ul>

            <div className="mt-9 border border-taupe/60 bg-cream/70 p-6">
              <p className="text-sm text-ink">{groupEvents.perksIntro}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {groupEvents.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-taupe" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-7 text-sm text-muted">
              <Link
                href="/contact-us"
                className="underline underline-offset-4 hover:text-ink"
              >
                Contact us
              </Link>{" "}
              for more group booking information.
            </p>
          </div>
        </div>
      </Section>

      {/* FULL BAR SERVICE */}
      <Section id="bar" tone="cream" size="md">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden bg-beige">
            <Image
              src={barService.image}
              alt="Full bar service at The Nail Room"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="Sip & relax"
              title="Full bar service"
              lead={barService.lead}
              align="left"
            />
            <ul className="mt-8 space-y-2.5 text-sm text-muted">
              {barService.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-taupe" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm text-muted">{barService.outro}</p>
            <BookNowButton className="mt-8" variant="outline" />
          </div>
        </div>
      </Section>

      {testimonials.length > 0 ? (
        <Section id="reviews" tone="sand" size="md">
          <SectionHeading
            eyebrow="In their words"
            title="What clients say"
          />
          <div className="mt-12">
            <TestimonialGrid
              testimonials={testimonials.slice(0, 3)}
              initialCount={3}
            />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/testimonials"
              className="inline-flex items-center justify-center border border-ink px-8 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-cream"
            >
              Read all reviews
            </Link>
          </div>
        </Section>
      ) : null}

      <CtaBanner />
    </>
  );
}
