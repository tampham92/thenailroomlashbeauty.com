import type { MetadataRoute } from "next";
import { getGalleries } from "@/data/galleries";
import { site } from "@/data/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const galleries = await getGalleries();

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/about-us", priority: 0.8 },
    { path: "/services", priority: 0.9 },
    { path: "/meet-our-team", priority: 0.7 },
    { path: "/gallery", priority: 0.8 },
    { path: "/testimonials", priority: 0.5 },
    { path: "/contact-us", priority: 0.8 },
    { path: "/policy", priority: 0.3 },
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...galleries.map((g) => ({
      url: `${site.url}/gallery/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
