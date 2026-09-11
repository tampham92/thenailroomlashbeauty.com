import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/data/site";
import BookNowButton from "./BookNowButton";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="bg-beige text-graphite">
      <div className="container-tnr py-14 sm:py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Image
              src={site.logo}
              alt={site.name}
              width={1000}
              height={1000}
              className="h-24 w-auto mix-blend-multiply"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Where elegance, self-care, and celebration come together in
              Sherwood Park.
            </p>
            <SocialLinks className="mt-6" />
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted">
              Contact us
            </h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted">Address</dt>
                <dd>
                  <a
                    href={site.address.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink hover:underline underline-offset-4"
                  >
                    {site.address.full}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Tel</dt>
                <dd>
                  <a
                    href={site.phoneHref}
                    className="hover:text-ink hover:underline underline-offset-4"
                  >
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Email</dt>
                <dd>
                  <a
                    href={`mailto:${site.email}`}
                    className="break-all hover:text-ink hover:underline underline-offset-4"
                  >
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted">
              Explore
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-graphite hover:text-ink hover:underline underline-offset-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/policy"
                  className="text-graphite hover:text-ink hover:underline underline-offset-4"
                >
                  Policy
                </Link>
              </li>
            </ul>
            <BookNowButton className="mt-7" variant="outline" />
          </div>
        </div>

        <div className="mt-14 border-t border-taupe/40 pt-6 text-xs text-muted sm:flex sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <Link href="/policy" className="mt-2 inline-block hover:text-ink sm:mt-0">
            Salon Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
