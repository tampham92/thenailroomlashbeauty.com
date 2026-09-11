import { readHome } from "@/lib/content";
import HomeEditor from "./HomeEditor";

export default async function AdminHomePage() {
  const home = await readHome();
  return <HomeEditor home={home} />;
}
