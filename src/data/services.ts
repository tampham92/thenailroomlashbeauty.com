import {
  readServices,
  type ServiceCategory,
  type ServiceItem,
} from "@/lib/content";

export type { ServiceCategory, ServiceItem };

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const { categories } = await readServices();
  return categories;
}
