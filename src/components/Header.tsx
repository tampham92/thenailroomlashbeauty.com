"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/data/nav";
import { useSite } from "./SiteProvider";
import BookNowButton from "./BookNowButton";

export default function Header() {
  const site = useSite();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-beige bg-cream/95 backdrop-blur"
          : "border-transparent bg-cream"
      }`}
    >
      <div className="container-tnr flex items-center justify-between gap-6 py-3">
        <Link href="/" aria-label={site.name} className="shrink-0">
          <Image
            src={site.logo}
            alt={site.name}
            width={1000}
            height={1000}
            priority
            className="h-14 w-auto sm:h-16"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[0.7rem] uppercase tracking-[0.18em] transition-colors hover:text-ink ${
                isActive(item.href)
                  ? "text-ink border-b border-taupe pb-1"
                  : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <BookNowButton className="px-6 py-2.5" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="lg:hidden -mr-2 p-2 text-ink"
        >
          <span className="sr-only">Menu</span>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="lg:hidden border-t border-beige bg-cream"
      >
        <nav className="container-tnr flex flex-col py-4" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`py-3 text-sm uppercase tracking-[0.16em] border-b border-beige/70 ${
                isActive(item.href) ? "text-ink" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <BookNowButton className="mt-6 w-full" />
        </nav>
      </div>
    </header>
  );
}
