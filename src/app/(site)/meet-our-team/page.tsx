import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBanner from "@/components/CtaBanner";
import { getTeam } from "@/data/team";

export const metadata: Metadata = {
  title: "Meet Our Team",
  description:
    "Meet the nail artists, lash technicians and hospitality team behind The Nail Room Lash & Beauty in Sherwood Park.",
  alternates: { canonical: "/meet-our-team" },
};

export default async function TeamPage() {
  const { hero: teamHero, members: team } = await getTeam();

  return (
    <>
      <PageHero
        eyebrow="The people behind the studio"
        title="Meet Our Team"
        image={teamHero}
      />

      <Section tone="cream" size="md">
        <div className="space-y-16 sm:space-y-20">
          {team.map((member, i) => (
            <article
              key={member.name}
              className="grid gap-8 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-center"
            >
              <div
                className={`relative aspect-[3/4] overflow-hidden bg-beige ${
                  i % 2 === 1 ? "sm:order-2" : ""
                }`}
              >
                <Image
                  src={member.photo}
                  alt={`${member.name} — ${member.role}`}
                  fill
                  sizes="(min-width: 640px) 280px, 100vw"
                  className="object-cover"
                />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl">{member.name}</h2>
                <p className="eyebrow mt-2">{member.role}</p>
                <span className="mt-5 block h-px w-12 bg-taupe" />
                <p className="mt-5 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                  {member.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Book with your favourite artist"
        lead="Choose your technician and service when you book online."
      />
    </>
  );
}
