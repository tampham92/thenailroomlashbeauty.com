import { readServices } from "@/lib/content";
import ServicesEditor from "./ServicesEditor";

export default async function AdminServicesPage() {
  const services = await readServices();
  return <ServicesEditor services={services} />;
}
