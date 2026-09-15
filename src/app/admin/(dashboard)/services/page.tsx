import { readServices } from "@/lib/content";
import { resolveServices } from "@/data/services";
import ServicesEditor from "./ServicesEditor";

export default async function AdminServicesPage() {
  return <ServicesEditor services={resolveServices(await readServices())} />;
}
