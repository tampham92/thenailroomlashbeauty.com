"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Item = { src: string; alt: string };

export default function GalleryGrid({ images }: { images: Item[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (delta: number) =>
      setActive((i) =>
        i === null ? i : (i + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, step]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className="group relative aspect-[4/5] overflow-hidden bg-beige"
            aria-label={`Open image: ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/15" />
          </button>
        ))}
      </div>

      {active !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[active].alt}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 p-3 text-cream/80 hover:text-cream"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 p-4 text-cream/70 hover:text-cream sm:left-6"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  aria-hidden="true"
                >
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 p-4 text-cream/70 hover:text-cream sm:right-6"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  aria-hidden="true"
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" />
                </svg>
              </button>
            </>
          ) : null}

          <div
            className="relative h-[82vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active].src}
              alt={images[active].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
