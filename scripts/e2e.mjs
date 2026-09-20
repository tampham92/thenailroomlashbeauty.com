#!/usr/bin/env node
/**
 * End-to-end check against a running production build.
 *
 *   npm run build && npx next start -p 3100 &
 *   node scripts/e2e.mjs                       # defaults to :3100
 *   BASE=http://localhost:3000 node scripts/e2e.mjs
 *
 * Drives the admin the way a browser without JavaScript would: Next renders
 * the Server Action reference into hidden $ACTION inputs, so posting the form
 * back exercises the real action, validation and revalidation path.
 *
 * Every suite restores what it changed. Point CONTENT_DIR at a scratch copy if
 * you would rather it not touch the repo defaults.
 */
const BASE = process.env.BASE ?? "http://localhost:3100";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "tnr-dev-password";

let cookie = "";
let failures = 0;

const ok = (label, pass, extra = "") => {
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`);
};

const store = (res) => {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const [name] = pair.split("=");
    cookie = [...cookie.split("; ").filter((x) => x && !x.startsWith(name + "=")), pair].join("; ");
  }
};

const get = async (path) => {
  const r = await fetch(BASE + path, { headers: { cookie }, redirect: "manual" });
  store(r);
  return { status: r.status, body: await r.text() };
};

const unescapeHtml = (s) =>
  s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/");

/** HTML-escape, for asserting against text that Next rendered. */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const findForm = (html, marker) =>
  (html.match(/<form[^>]*>[\s\S]*?<\/form>/g) ?? []).find((f) => f.includes(marker));

const submit = async (path, fields, marker) => {
  const page = await get(path);
  const form = findForm(page.body, marker);
  if (!form) throw new Error(`no form matching "${marker}" at ${path} (status ${page.status})`);

  const fd = new FormData();
  for (const tag of form.match(/<input[^>]*type="hidden"[^>]*>/g) ?? []) {
    const name = tag.match(/name="([^"]+)"/)?.[1];
    if (!name?.startsWith("$ACTION")) continue;
    fd.append(name, unescapeHtml(tag.match(/value="([^"]*)"/)?.[1] ?? ""));
  }
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);

  const r = await fetch(BASE + path, { method: "POST", headers: { cookie }, body: fd, redirect: "manual" });
  store(r);
  return { status: r.status, body: await r.text() };
};

const payloadOf = (html) => {
  const m = html.match(/name="payload" value="([^"]*)"/);
  if (!m) throw new Error("no payload field on the page");
  return JSON.parse(unescapeHtml(m[1]));
};

/* ------------------------------------------------------------------ auth */

await submit("/admin/login", { next: "/admin", password: "definitely-wrong" }, "current-password");
ok("wrong password creates no session", !cookie.includes("tnr_admin"));

await submit("/admin/login", { next: "/admin", password: PASSWORD }, "current-password");
ok("correct password signs in", cookie.includes("tnr_admin"), PASSWORD === "tnr-dev-password" ? "" : "custom password");
if (!cookie.includes("tnr_admin")) {
  console.error("\nCannot sign in — set ADMIN_PASSWORD to match the running server.");
  process.exit(1);
}

/* ------------------------------------------------------- public pages up */

for (const path of ["/", "/about-us", "/services", "/meet-our-team", "/gallery", "/testimonials", "/contact-us", "/policy"]) {
  const r = await get(path);
  ok(`${path} renders`, r.status === 200 && r.body.includes("</html>"), `status ${r.status}`);
}

/* ------------------------------------------------- reveal cannot hide all */

const team = await get("/meet-our-team");
ok("team members are in the HTML", (team.body.match(/<article/g) ?? []).length >= 3,
   `${(team.body.match(/<article/g) ?? []).length} articles`);
ok("the photo column is 280px on both sides", !/grid-cols-\[minmax\(0,280px\)_1fr\][^"]*"[^>]*>\s*<div class="[^"]*sm:order-2/.test(team.body));

/* --------------------------------------------------- banner text placement */

const aboutAdmin = await get("/admin/about");
const about = payloadOf(aboutAdmin.body);
ok("about banner loads", Boolean(about.banner?.image));

await submit("/admin/about", { payload: JSON.stringify({ ...about, banner: { ...about.banner, title: "E2E Title", lead: "E2E lead", textPlacement: "overlay" } }) }, 'name="payload"');
let pub = await get("/about-us");
ok("overlay shows the title over the cover", pub.body.includes("E2E Title") && pub.body.includes("bg-black/40"));

await submit("/admin/about", { payload: JSON.stringify({ ...about, banner: { ...about.banner, title: "E2E Title", lead: "E2E lead", textPlacement: "hidden" } }) }, 'name="payload"');
pub = await get("/about-us");
ok("hidden keeps the h1 for search engines", /<h1 class="sr-only">E2E Title<\/h1>/.test(pub.body));

await submit("/admin/about", { payload: JSON.stringify({ ...about, banner: { ...about.banner, image: "" } }) }, 'name="payload"');
ok("a banner with no image is rejected", (await get("/admin/about")).body.includes(about.banner.image));

await submit("/admin/about", { payload: JSON.stringify(about) }, 'name="payload"');
ok("about restored", (await get("/about-us")).body.includes(esc(about.paragraphs[0]).slice(0, 40)));

/* --------------------------------------------------------- testimonials */

const t0 = payloadOf((await get("/admin/testimonials")).body);
const many = Array.from({ length: 14 }, (_, i) => ({
  quote: `E2E review ${i + 1}`, author: `E2E client ${i + 1}`, rating: (i % 5) + 1, source: "Google",
}));
await submit("/admin/testimonials", { payload: JSON.stringify(many) }, 'name="payload"');

const list = await get("/testimonials");
ok("all reviews reach the HTML", (list.body.match(/<figure/g) ?? []).length === 14,
   `${(list.body.match(/<figure/g) ?? []).length} figures`);
ok("extras are hidden, not dropped", (list.body.match(/<figure hidden=""/g) ?? []).length === 5);
ok("show-all button appears", /Show all <!-- -->14<!-- --> reviews/.test(list.body));
ok("homepage shows three reviews", ((await get("/")).body.match(/<figure/g) ?? []).length === 3);

await submit("/admin/testimonials", { payload: JSON.stringify([]) }, 'name="payload"');
ok("empty state returns", (await get("/testimonials")).body.includes("collecting reviews"));
ok("homepage drops the section when empty", !(await get("/")).body.includes("What clients say"));
await submit("/admin/testimonials", { payload: JSON.stringify(t0) }, 'name="payload"');

/* --------------------------------------------------------------- gallery */

const gEdit = payloadOf((await get("/admin/gallery/nails-gallery")).body);
const fewer = { ...gEdit, title: "E2E Gallery", images: gEdit.images.slice(0, -1) };
const saved = await submit("/admin/gallery/nails-gallery", { slug: "nails-gallery", payload: JSON.stringify(fewer) }, 'name="payload"');
ok("gallery saves", saved.body.includes("Saved"));
const gPub = await get("/gallery/nails-gallery");
ok("gallery page follows the edit", gPub.body.includes("E2E Gallery") &&
   (gPub.body.match(/Open image:/g) ?? []).length === gEdit.images.length - 1);
ok("a gallery with no images is rejected",
   (await submit("/admin/gallery/nails-gallery", { slug: "nails-gallery", payload: JSON.stringify({ ...gEdit, images: [] }) }, 'name="payload"')).body.includes("at least one image"));
await submit("/admin/gallery/nails-gallery", { slug: "nails-gallery", payload: JSON.stringify(gEdit) }, 'name="payload"');
ok("gallery restored", (await get("/gallery/nails-gallery")).body.includes(esc(gEdit.title)));

/* ------------------------------------------------------------ protection */

const saveCookie = cookie;
cookie = "";
ok("anonymous admin access redirects", (await get("/admin/team")).status === 307);
cookie = saveCookie;

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
