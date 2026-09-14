import { readAbout } from "@/lib/content";
import AboutEditor from "./AboutEditor";

export default async function AdminAboutPage() {
  const about = await readAbout();
  return <AboutEditor about={about} />;
}
