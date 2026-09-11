import Image from "next/image";

type Props = {
  title: string;
  eyebrow?: string;
  lead?: string;
  image?: string;
};

export default function PageHero({ title, eyebrow, lead, image }: Props) {
  if (!image) {
    return (
      <section className="bg-sand">
        <div className="container-tnr py-16 text-center sm:py-24">
          {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
          <h1 className="text-4xl tracking-wide sm:text-5xl">{title}</h1>
          {lead ? (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted">
              {lead}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate flex min-h-[42vh] items-center overflow-hidden sm:min-h-[52vh]">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="container-tnr relative z-10 py-20 text-center text-cream">
        {eyebrow ? <p className="eyebrow mb-4 text-cream/75">{eyebrow}</p> : null}
        <h1 className="text-4xl tracking-wide text-cream sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {lead ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream/85">
            {lead}
          </p>
        ) : null}
      </div>
    </section>
  );
}
