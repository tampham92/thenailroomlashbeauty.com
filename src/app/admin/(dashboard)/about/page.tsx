import { readAbout } from "@/lib/content";
import { resolveAbout } from "@/data/about";
import AboutEditor from "./AboutEditor";

export default async function AdminAboutPage() {
  return <AboutEditor about={resolveAbout(await readAbout())} />;
}
