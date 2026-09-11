import Link from "next/link";
import BookNowButton from "@/components/BookNowButton";

export default function NotFound() {
  return (
    <section className="bg-cream">
      <div className="container-tnr flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Page not found</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-ink px-8 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-cream"
          >
            Back home
          </Link>
          <BookNowButton />
        </div>
      </div>
    </section>
  );
}
