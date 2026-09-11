import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Props = {
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: "cream" | "sand" | "beige" | "ink" | "white";
  size?: "sm" | "md" | "lg";
};

const tones = {
  cream: "bg-cream text-graphite",
  sand: "bg-sand text-graphite",
  beige: "bg-beige text-graphite",
  white: "bg-white text-graphite",
  ink: "bg-ink text-cream",
} as const;

const sizes = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-24",
  lg: "py-20 sm:py-32",
} as const;

export default function Section({
  children,
  id,
  className = "",
  tone = "cream",
  size = "md",
}: Props) {
  return (
    <section id={id} className={`${tones[tone]} ${sizes[size]} ${className}`}>
      <div className="container-tnr">
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}
