import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import { policies, policyIntro, policyOutro } from "@/data/policy";

export const metadata: Metadata = {
  title: "Salon Policy",
  description: policyIntro,
  alternates: { canonical: "/policy" },
};

export default function PolicyPage() {
  return (
    <>
      <PageHero eyebrow="Good to know" title="Salon Policy" lead={policyIntro} />

      <Section tone="cream" size="md">
        <ol className="mx-auto max-w-3xl space-y-9">
          {policies.map((p, i) => (
            <li key={p.title} className="border-b border-beige pb-8 last:border-0">
              <h2 className="flex items-baseline gap-3 text-xl sm:text-2xl">
                <span className="text-sm text-taupe">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-12 max-w-3xl text-center text-sm italic text-muted">
          {policyOutro}
        </p>
      </Section>
    </>
  );
}
