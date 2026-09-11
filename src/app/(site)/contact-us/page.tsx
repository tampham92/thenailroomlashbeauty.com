import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import BookNowButton from "@/components/BookNowButton";
import SocialLinks from "@/components/SocialLinks";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Visit The Nail Room Lash & Beauty at ${site.address.full}. Call or text ${site.phone}.`,
  alternates: { canonical: "/contact-us" },
};

const details = [
  {
    label: "Call / Text us",
    value: site.phone,
    href: site.phoneHref,
    icon: "M6.6 3h2.6l1.3 3.2-1.7 1.2a11.5 11.5 0 0 0 5.8 5.8l1.2-1.7L19 12.8v2.6a2 2 0 0 1-2.2 2A16 16 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z",
  },
  {
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    icon: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm.7 2 7.3 5.2L19.3 8",
  },
  {
    label: "Address",
    value: site.address.full,
    href: site.address.mapUrl,
    icon: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="We’d love to hear from you"
        title="Contact us"
        lead="Questions about a service, a group booking or a private event? Reach out — we usually reply the same day."
      />

      <Section tone="cream" size="md">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <dl className="space-y-9">
              {details.map((d) => (
                <div key={d.label} className="flex gap-5">
                  <span className="mt-1 shrink-0 text-taupe">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={d.icon} />
                    </svg>
                  </span>
                  <div>
                    <dt className="eyebrow">{d.label}</dt>
                    <dd className="mt-1.5">
                      <a
                        href={d.href}
                        target={d.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          d.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-lg text-ink underline-offset-4 hover:underline"
                      >
                        {d.value}
                      </a>
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <p className="eyebrow">Follow us</p>
              <SocialLinks className="mt-3" size={22} />
            </div>

            <BookNowButton className="mt-10" />
          </div>

          <div className="overflow-hidden border border-beige bg-beige">
            <iframe
              title={`Map to ${site.name}`}
              src="https://www.google.com/maps?q=975+Broadmoor+Blvd+%2320,+Sherwood+Park,+AB+T8A+5W9&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full border-0 lg:h-full lg:min-h-[460px]"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
