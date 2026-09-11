import Link from "next/link";
import { readGalleries, readHome, readTeam, readTestimonials } from "@/lib/content";

export default async function AdminDashboard() {
  const [{ galleries }, team, { testimonials }, home] = await Promise.all([
    readGalleries(),
    readTeam(),
    readTestimonials(),
    readHome(),
  ]);

  const imageCount = galleries.reduce((sum, g) => sum + g.images.length, 0);

  const cards = [
    {
      href: "/admin/home",
      title: "Homepage",
      stat: `${home.hero.slides.length} hero slides · 6 sections`,
      body: "Hero, why clients love us, our story, services, events and bar service.",
    },
    {
      href: "/admin/gallery",
      title: "Gallery",
      stat: `${galleries.length} galleries · ${imageCount} images`,
      body: "Add, remove and reorder photos, edit captions and cover images.",
    },
    {
      href: "/admin/team",
      title: "Team",
      stat: `${team.members.length} members`,
      body: "Update photos, names, roles and bios on the Meet Our Team page.",
    },
    {
      href: "/admin/testimonials",
      title: "Testimonials",
      stat:
        testimonials.length === 0
          ? "None yet"
          : `${testimonials.length} published`,
      body: "Add client reviews shown on the Testimonials page.",
    },
  ];

  return (
    <>
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Changes go live on the site as soon as you save.
      </p>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block border border-neutral-200 p-6 transition-colors hover:border-ink"
          >
            <h2 className="font-display text-xl text-ink">{card.title}</h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">
              {card.stat}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {card.body}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
