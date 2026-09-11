"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Site } from "@/lib/site-shape";

const SiteContext = createContext<Site | null>(null);

export function SiteProvider({
  site,
  children,
}: {
  site: Site;
  children: ReactNode;
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

/** Business details for client components. Server components use getSite(). */
export function useSite(): Site {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite must be used inside <SiteProvider>");
  return site;
}
