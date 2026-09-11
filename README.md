# The Nail Room Lash & Beauty — Next.js

Next.js 16 (App Router) rebuild of the original WordPress/Flatsome site at
https://thenailroomlashbeauty.com — all content is static and lives in `src/data`.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript, Tailwind CSS v4
- Fonts: Cormorant Garamond (display) + Jost (body) via `next/font`
- Built-in admin at `/admin` (password-protected) for nearly all site content
- No external CMS: editable content is JSON in `content/`, images on disk

## Getting started

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev                  # http://localhost:3000
npm run build                # production build
npm run lint
```

Generate a session secret with `openssl rand -base64 32`. The app refuses to
sign in if `ADMIN_SESSION_SECRET` is missing or shorter than 16 characters.

## Routes (14, matching the original sitemap)

| Route | Source page |
| --- | --- |
| `/` | Home |
| `/about-us` | About Us |
| `/services` | Services (pricing menu) |
| `/meet-our-team` | Meet our team |
| `/gallery` | Gallery hub |
| `/gallery/our-space-gallery` | Our Space Gallery |
| `/gallery/nails-gallery` | Nails Gallery |
| `/gallery/pedicures-gallery` | Pedicures Gallery |
| `/gallery/brows-lashes-gallery` | Brows & Lashes Gallery |
| `/gallery/events-gallery` | Events Gallery |
| `/gallery/bar-service-gallery` | Bar Service Gallery |
| `/testimonials` | Testimonials |
| `/contact-us` | Contact Us |
| `/policy` | Salon Policy |

Plus `/sitemap.xml`, `/robots.txt` and a custom 404.

## Admin

`/admin` — sign in with `ADMIN_PASSWORD`. Manages:

- **Homepage** — all six sections: hero slides + headline, "why clients love us"
  reasons, our story, the service summary groups, group events (occasions and
  perks) and full bar service
- **Gallery** — upload, remove, reorder photos; edit alt text, cover, title and blurb
- **Team** — add/remove/reorder members, upload photos, edit roles and bios
- **Testimonials** — add, edit, reorder (the public page shows a "leave a review"
  panel while the list is empty)
- **Services & pricing** — categories and the full price menu
- **Salon policy** — intro, numbered policies, closing line
- **Business details** — booking link, phone, email, address, socials, SEO text

Saving writes the JSON file and calls `revalidatePath`, so the static public
pages regenerate immediately.

Session is a signed HttpOnly cookie valid for 12 hours. `src/proxy.ts` blocks
unauthenticated navigation and every server action re-checks with `requireAuth()`.

### Where uploads go

Uploaded images are written to `data/uploads/` and served by the
`/uploads/[...path]` route handler — **not** `public/`. `next build` snapshots
the `public/` directory, so anything written there at runtime is never served.

`data/uploads/` is gitignored and must be on persistent, writable storage. Back
it up together with `content/`.

Images migrated from WordPress stay in `public/images/` and are never deleted by
the admin; only files under `data/uploads/` are cleaned up when they stop being
referenced.

## Editing content

Editable through `/admin`:

| File | What it controls |
| --- | --- |
| `content/site.json` | Booking link, phone, email, address, socials, SEO text |
| `content/home.json` | Every homepage section |
| `content/services.json` | Service categories, prices and descriptions |
| `content/policy.json` | Salon policy |
| `content/galleries.json` | Gallery categories and their images |
| `content/team.json` | Team members, roles, bios, photos |
| `content/testimonials.json` | Client testimonials |

Code-only (edit and redeploy):

| File | What it controls |
| --- | --- |
| `src/data/nav.ts` | Header/footer navigation — mirrors the routes, so it stays in code |
| `src/lib/site-shape.ts` | `SITE_CONFIG`: the canonical site URL and logo path |

Derived values are computed, not stored: the `tel:` link comes from the phone
number and the one-line address from its parts, so they cannot drift apart.

Client components (header, footer, booking button) read the business details
through `SiteProvider`; server components call `getSite()`.

## Deploying

Needs a long-running Node server with writable storage — not a static host.
See **[DEPLOY.md](DEPLOY.md)** for the full VPS + nginx runbook.

The essentials: `content/` and `data/uploads/` are runtime state, so on a server
point `CONTENT_DIR` and `UPLOAD_DIR` at paths **outside the checkout**
(`content/*.json` is tracked in git but rewritten by the admin, so a `git pull`
would otherwise overwrite it). Set `SITE_URL` per environment, and
`SITE_NOINDEX=1` on anything that is not production.

## Notes on the migration

- The original `/testimonials` page was published empty, so there was no content
  to migrate. Add entries to `src/data/testimonials.ts` and the page renders a
  grid automatically.
- The original contact page had no form — only contact details. A Google Maps
  embed was added in place of the plain map link.
- 62 images were pulled from the WordPress media library into `public/images`.
- `middleware.ts` is `proxy.ts` here: Next.js 16 renamed the convention.
