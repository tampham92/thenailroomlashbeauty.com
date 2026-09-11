type Props = {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
};

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  tone = "dark",
}: Props) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow ? (
        <p className={`eyebrow mb-4 ${tone === "light" ? "text-cream/70" : ""}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight tracking-wide ${
          tone === "light" ? "text-cream" : ""
        }`}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={`mt-5 text-base sm:text-lg leading-relaxed ${
            tone === "light" ? "text-cream/80" : "text-muted"
          }`}
        >
          {lead}
        </p>
      ) : null}
      <span
        className={`mt-7 block h-px w-16 ${
          align === "center" ? "mx-auto" : ""
        } ${tone === "light" ? "bg-cream/40" : "bg-taupe"}`}
      />
    </div>
  );
}
