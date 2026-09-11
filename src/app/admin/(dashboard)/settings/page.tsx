import { readSite } from "@/lib/content";
import SettingsEditor from "./SettingsEditor";

export default async function AdminSettingsPage() {
  const site = await readSite();
  return <SettingsEditor site={site} />;
}
