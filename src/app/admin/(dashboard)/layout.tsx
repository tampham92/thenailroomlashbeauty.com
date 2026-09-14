import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** The admin always reads the JSON files fresh — never serve a cached editor. */
export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/home", label: "Homepage" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/policy", label: "Policy" },
  { href: "/admin/settings", label: "Business details" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
          <Link href="/admin" className="font-display text-lg text-ink">
            The Nail Room — Admin
          </Link>

          <nav className="flex flex-wrap gap-5 text-sm" aria-label="Admin">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-neutral-500 transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link
              href="/"
              target="_blank"
              className="text-neutral-500 hover:text-ink"
            >
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-neutral-300 px-3 py-1.5 text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-ink hover:text-ink"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        {children}
      </main>
    </div>
  );
}
