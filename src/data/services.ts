import {
  normalizeBanner,
  readServices,
  type PageBanner,
  type ServiceCategory,
  type ServiceItem,
  type ServicesFile,
} from "@/lib/content";

export type { ServiceCategory, ServiceItem };

export type Services = { banner: PageBanner; categories: ServiceCategory[] };

export function resolveServices(file: ServicesFile): Services {
  return {
    banner: normalizeBanner(file.banner, {
      image: "/images/2026-02-Book-An-Appointment.jpg",
      eyebrow: "Menu",
      title: "Services",
      lead:
        "Prices shown in CAD. A \u201C+\u201D indicates a starting price \u2014 final pricing depends on length, design and condition.",
      textPlacement: "overlay",
    }),
    categories: file.categories,
  };
}

export async function getServices(): Promise<Services> {
  return resolveServices(await readServices());
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  return (await getServices()).categories;
}
