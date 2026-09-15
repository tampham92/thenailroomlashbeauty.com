import {
  normalizeBanner,
  readAbout,
  type AboutFile,
  type PageBanner,
} from "@/lib/content";

export type About = {
  banner: PageBanner;
  metaDescription: string;
  sideImage: string;
  sideImageAlt: string;
  paragraphs: string[];
};

export function resolveAbout(file: AboutFile): About {
  return {
    banner: normalizeBanner(file.banner, {
      image: file.heroImage ?? "",
      eyebrow: file.eyebrow ?? "",
      title: file.title ?? "About Us",
      lead: "",
      textPlacement: "overlay",
    }),
    metaDescription: file.metaDescription,
    sideImage: file.sideImage,
    sideImageAlt: file.sideImageAlt,
    paragraphs: file.paragraphs,
  };
}

export async function getAbout(): Promise<About> {
  return resolveAbout(await readAbout());
}
