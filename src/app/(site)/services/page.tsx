import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import CtaBanner from "@/components/CtaBanner";
import { getServiceCategories } from "@/data/services";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description:
    "Acrylic, gel builder, Gel-X, BIAB, signature manicures, gold and spa pedicures, lash extensions, lash lifts and brow services in Sherwood Park.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const serviceCategories = await getServiceCategories();

  return (
    <>
      <PageHero
        eyebrow="Menu"
        title="Services"
        lead="Prices shown in CAD. A “+” indicates a starting price — final pricing depends on length, design and condition."
        image="/images/2026-02-Book-An-Appointment.jpg"
      />

      <nav
        aria-label="Service categories"
        className="sticky top-[73px] z-30 border-b border-beige bg-cream/95 backdrop-blur"
      >
        <div className="container-tnr flex justify-center gap-6 overflow-x-auto py-4">
          {serviceCategories.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="whitespace-nowrap text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
            >
              {c.title}
            </a>
          ))}
        </div>
      </nav>

      {serviceCategories.map((category, idx) => (
        <Section
          key={category.id}
          id={category.id}
          tone={idx % 2 === 0 ? "cream" : "sand"}
          size="md"
          className="scroll-mt-32"
        >
          <SectionHeading title={category.title} />

          <div className="mx-auto mt-12 max-w-4xl divide-y divide-beige">
            {category.items.map((item) => (
              <article key={item.name} className="py-8 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-xl sm:text-2xl">
                    {item.name}
                    {item.subtitle ? (
                      <span className="ml-2 font-sans text-xs tracking-wide text-muted">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </h3>
                  {item.price ? (
                    <p className="font-sans text-sm tracking-[0.08em] text-ink">
                      {item.price}
                      {item.duration ? (
                        <span className="ml-2 text-muted">{item.duration}</span>
                      ) : null}
                    </p>
                  ) : null}
                </div>

                {item.headline ? (
                  <p className="mt-2 text-sm italic text-taupe">
                    {item.headline}
                  </p>
                ) : null}

                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                  {item.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>
      ))}

      <CtaBanner
        title="Book your service"
        lead="Reserve your spot online — appointments fill quickly on weekends."
      />
    </>
  );
}
