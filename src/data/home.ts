import { readHome, type HomeFile } from "@/lib/content";

export type { HomeFile };

export async function getHome(): Promise<HomeFile> {
  return readHome();
}
