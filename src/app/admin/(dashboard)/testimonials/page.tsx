import { readTestimonials } from "@/lib/content";
import TestimonialsEditor from "./TestimonialsEditor";

export default async function AdminTestimonialsPage() {
  const { testimonials } = await readTestimonials();
  return <TestimonialsEditor testimonials={testimonials} />;
}
