"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import BookNowButton from "./BookNowButton";
import { site } from "@/data/site";

type Hero = { slides: string[]; tagline: string; intro: string };

const INTERVAL = 6000;

export default function HeroSlider({ hero }: { hero: Hero }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || hero.slides.length < 2) return;

    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % hero.slides.length),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, [hero.slides.length]);

  return (
    <section className="relative isolate h-[78vh] min-h-[520px] w-full overflow-hidden sm:h-[88vh]">
      {hero.slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1400ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 flex h-full items-center">
        <div className="container-tnr">
          <div className="max-w-2xl text-cream">
            <p className="eyebrow text-cream/75">{site.address.city}, Alberta</p>
            <h1 className="mt-5 font-display text-4xl leading-[1.15] text-cream sm:text-5xl lg:text-6xl">
              {hero.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/85 sm:text-base">
              {hero.intro}
            </p>
            <BookNowButton className="mt-9" variant="light" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {hero.slides.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-9 bg-cream" : "w-4 bg-cream/50 hover:bg-cream/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
