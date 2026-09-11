import { readSite } from "@/lib/content";
import { resolveSite, type Site, type SiteFile } from "@/lib/site-shape";

export type { Site, SiteFile };
export { SITE_CONFIG } from "@/lib/site-shape";

export async function getSite(): Promise<Site> {
  return resolveSite(await readSite());
}
