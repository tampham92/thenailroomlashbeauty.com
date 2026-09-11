import { readTestimonials, type Testimonial } from "@/lib/content";

export type { Testimonial };

export async function getTestimonials(): Promise<Testimonial[]> {
  const { testimonials } = await readTestimonials();
  return testimonials;
}
