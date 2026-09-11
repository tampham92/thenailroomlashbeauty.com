import Link from "next/link";
import BookNowButton from "./BookNowButton";

export default function CtaBanner({
  title = "Ready for your next appointment?",
  lead = "Book online in a few taps, or contact us for group bookings and private events.",
}: {
  title?: string;
  lead?: string;
}) {
  return (
    <section className="bg-ink text-cream">
      <div className="container-tnr py-16 text-center sm:py-20">
        <h2 className="text-3xl text-cream sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/75 sm:text-base">
          {lead}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <BookNowButton variant="light" />
          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] text-cream/80 underline underline-offset-8 transition-colors hover:text-cream"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
