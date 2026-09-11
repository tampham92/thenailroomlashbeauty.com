"use client";

import { useSite } from "./SiteProvider";

type Props = {
  className?: string;
  label?: string;
  variant?: "solid" | "outline" | "light";
};

const base =
  "inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] transition-colors duration-300";

const variants = {
  solid: "bg-ink text-cream hover:bg-graphite",
  outline: "border border-ink text-ink hover:bg-ink hover:text-cream",
  light: "border border-cream/80 text-cream hover:bg-cream hover:text-ink",
} as const;

export default function BookNowButton({
  className = "",
  label = "Book now",
  variant = "solid",
}: Props) {
  const site = useSite();
  return (
    <a
      href={site.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${variants[variant]} ${className}`}
    >
      {label}
    </a>
  );
}
