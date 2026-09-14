import { readAbout, type AboutFile } from "@/lib/content";

export type { AboutFile };

export async function getAbout(): Promise<AboutFile> {
  return readAbout();
}
