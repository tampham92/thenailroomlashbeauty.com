# Deploying to a VPS

Target for this guide: `https://demo.thenailroomlashbeauty.com` on Ubuntu with
nginx already installed.

The app needs a long-running Node process. It cannot be exported as a static
site, because `/admin` writes files and the public pages are regenerated on
demand.

## Layout

| Path                             | What it is                          | Survives a deploy?       |
| -------------------------------- | ----------------------------------- | ------------------------ |
| `/var/www/thenailroom`         | the git checkout                    | replaced on every deploy |
| `/var/lib/thenailroom/content` | live`*.json` edited in `/admin` | **must persist**   |
| `/var/lib/thenailroom/uploads` | images uploaded in`/admin`        | **must persist**   |
| `/etc/thenailroom.env`         | secrets and per-host settings       | **must persist**   |

Keeping content outside the checkout is not optional. `content/*.json` is
tracked in git *and* rewritten by the admin, so if the live copy sat inside
`/var/www/thenailroom`, the next `git pull` would overwrite whatever the salon
had edited.

## 1. Prerequisites

Node must be installed **system-wide**, not through nvm/fnm under `/root`. The
service runs as `www-data`, which cannot see another user's nvm install — and
the systemd unit hardens the process with `ProtectHome=true`, so `/root` is
unreadable to it regardless.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify, as the user that will actually run the app:

```bash
which npm                      # expect /usr/bin/npm
sudo -u www-data /usr/bin/node -v
nginx -v
```

Point DNS at the server before requesting a certificate:

```
demo.thenailroomlashbeauty.com.  A  <your server IP>
```

## 2. Directories and checkout

```bash
sudo mkdir -p /var/www /var/lib/thenailroom/content /var/lib/thenailroom/uploads

sudo git clone https://github.com/tampham92/thenailroomlashbeauty.com.git \
     /var/www/thenailroom

sudo chown -R www-data:www-data /var/www/thenailroom /var/lib/thenailroom
```

Clone straight into `/var/www`, never into `/root` with a symlink: `/root` is
mode 700, so `www-data` cannot traverse it and every npm command fails with
EACCES — or, more confusingly, with "npm ci can only install with an existing
package-lock.json", because npm cannot see the file at all.

`chown` matters as much as the path: `npm ci` writes `node_modules/` and the
build writes `.next/`, so the service user needs write access, not just read.

### Repository credentials

A private repo needs credentials. A read-only **deploy key** is the right
choice for a server — `gh auth login` would store an account-wide token that
grants access to every other private repo.

The key has to belong to the user that runs `git pull`, which is `www-data`,
not root. A key and an SSH host alias under `/root/.ssh` are invisible to it:
`www-data` has `/var/www` as its home, and `git pull` then fails with
`Could not resolve hostname github-thenailroom`.

```bash
sudo mkdir -p /var/www/.ssh
sudo ssh-keygen -t ed25519 -C "deploy@thenailroom" \
     -f /var/www/.ssh/thenailroom_deploy -N ""

sudo tee /var/www/.ssh/config >/dev/null <<'EOF'
Host github-thenailroom
    HostName github.com
    User git
    IdentityFile /var/www/.ssh/thenailroom_deploy
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF

sudo chown -R www-data:www-data /var/www/.ssh
sudo chmod 700 /var/www/.ssh
sudo chmod 600 /var/www/.ssh/thenailroom_deploy /var/www/.ssh/config

sudo cat /var/www/.ssh/thenailroom_deploy.pub
```

Add that public key to the repository under **Settings → Deploy keys**, leaving
"Allow write access" unchecked. `StrictHostKeyChecking accept-new` matters:
without it the first connection stops at an interactive host-key prompt that
`sudo -u www-data` cannot answer.

```bash
sudo -u www-data ssh -T github-thenailroom    # expect "Hi tampham92/...!"
```

Then clone over that alias:

```bash
sudo -u www-data git clone \
     github-thenailroom:tampham92/thenailroomlashbeauty.com.git \
     /var/www/thenailroom
```

## 3. Environment file

```bash
sudo cp /var/www/thenailroom/deploy/thenailroom.env.example /etc/thenailroom.env
sudo chown root:www-data /etc/thenailroom.env
sudo chmod 640 /etc/thenailroom.env
sudo nano /etc/thenailroom.env
```

`640` with group `www-data`: the build runs as that user and has to read this
file. It stays unreadable to everyone else.

Fill in:

```bash
ADMIN_PASSWORD=<the password the salon will type>
ADMIN_SESSION_SECRET=<openssl rand -base64 32>
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<openssl rand -base64 32>

CONTENT_DIR=/var/lib/thenailroom/content
UPLOAD_DIR=/var/lib/thenailroom/uploads

SITE_URL=https://demo.thenailroomlashbeauty.com
SITE_NOINDEX=1
PORT=3000
```

Generate `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` once and never change it. Next.js
otherwise derives a fresh key on each build, and references issued by the
previous build stop being decryptable after a deploy.

`SITE_NOINDEX=1` is important on the demo: it serves `robots.txt` with
`Disallow: /` and adds `noindex`, so this copy cannot compete with the real
site in search results. Remove it (or set `0`) only on the production host, and
set `SITE_URL` to the production domain there.

## 4. Build

```bash
cd /var/www/thenailroom
sudo -u www-data npm ci
sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env npm run deploy:build
```

`with-env.mjs` parses the env file and runs the command directly — no shell in
between. Sourcing the file with `set -a; . file` executes it, so a password
containing a space, quote, `$`, `&` or `<` runs as a command and the variable
silently ends up empty. This way any password works, quoted or not, and the
script refuses to start if `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` is
missing or too short.

`deploy:build` seeds `CONTENT_DIR` from the repo defaults (existing files are
never overwritten) and then runs `next build`. The build prerenders pages from
`CONTENT_DIR`, so seeding has to happen first.

### Pick a free port first

A VPS that already hosts something is likely to have 3000 taken:

```bash
sudo ss -ltnp 'sport = :3000'    # empty output means it is free
```

If it is in use, set a different `PORT` in `/etc/thenailroom.env` **and** the
matching `proxy_pass` in the nginx server block. They must agree.

## 5. systemd

```bash
sudo cp /var/www/thenailroom/deploy/thenailroom.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now thenailroom
sudo systemctl status thenailroom
```

```bash
curl -I http://127.0.0.1:3000     # expect 200 before touching nginx
journalctl -u thenailroom -f      # logs
```

If the log shows `EADDRINUSE`, stop the service before investigating —
`Restart=on-failure` otherwise respawns it every 5 seconds and the port keeps
looking busy:

```bash
sudo systemctl stop thenailroom
sudo ss -ltnp | grep ':3000'
```

To move the app to another port, change it in **both** places or nginx will
answer 502: `PORT` in `/etc/thenailroom.env` and `proxy_pass` in the nginx
server block.

## 6. nginx

```bash
sudo cp /var/www/thenailroom/deploy/nginx-demo.thenailroomlashbeauty.com.conf \
        /etc/nginx/sites-available/demo.thenailroomlashbeauty.com
sudo ln -s /etc/nginx/sites-available/demo.thenailroomlashbeauty.com \
           /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

The config sets `client_max_body_size 15M`. nginx defaults to 1 MB, which would
reject admin image uploads with `413` before they ever reach the app.

## 7. HTTPS

```bash
sudo certbot --nginx -d demo.thenailroomlashbeauty.com
```

Certbot edits the same file to add the TLS block and the HTTP redirect.

## Going live on the apex domain

Replacing the WordPress site at `thenailroomlashbeauty.com` with this app.

### Back up WordPress first, delete it last

Do not remove the WordPress files or database until the new site is verified
and you have a copy you could restore from:

```bash
sudo tar czf ~/wordpress-files-$(date +%F).tar.gz /var/www/<wordpress-dir>
mysqldump -u root -p <wp_database> | gzip > ~/wordpress-db-$(date +%F).sql.gz
```

### 1. Point the environment at the new host

```bash
sudo nano /etc/thenailroom.env
```

```bash
SITE_URL="https://thenailroomlashbeauty.com"
SITE_NOINDEX="0"
```

`SITE_NOINDEX` **must** become `0` here. Left at `1`, the live site serves
`robots.txt` with `Disallow: /` and a `noindex` tag on every page — visitors
see a working site while Google quietly drops it.

### 2. Rebuild — restarting is not enough

`SITE_URL` and `SITE_NOINDEX` are read when the module loads, and the public
pages, `robots.txt` and `sitemap.xml` are all prerendered at build time. A
service restart keeps serving the old values: the demo domain in every
canonical tag and `Disallow: /` in robots.txt.

```bash
cd /var/www/thenailroom
sudo -u www-data git pull
sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env npm run deploy:build
sudo systemctl restart thenailroom
```

Verify before touching nginx:

```bash
curl -s http://127.0.0.1:3000/robots.txt          # expect Allow: / and Disallow: /admin
curl -s http://127.0.0.1:3000/ | grep canonical   # expect the apex domain
```

### 3. Switch nginx over

```bash
sudo cp deploy/nginx-thenailroomlashbeauty.com.conf \
        /etc/nginx/sites-available/thenailroomlashbeauty.com
sudo ln -s /etc/nginx/sites-available/thenailroomlashbeauty.com /etc/nginx/sites-enabled/

ls -l /etc/nginx/sites-enabled/          # find the WordPress block
sudo rm /etc/nginx/sites-enabled/<wordpress-site>

sudo nginx -t && sudo systemctl reload nginx
```

Adjust `proxy_pass` in the new file if the app is not on port 3000.

### 4. Certificate

`www` needs a DNS record of its own before certbot can validate it:

```bash
dig +short www.thenailroomlashbeauty.com    # must return the server IP
sudo certbot --nginx -d thenailroomlashbeauty.com -d www.thenailroomlashbeauty.com
```

### 5. Retire the demo subdomain

The demo and production share one service and one build, so the demo would now
serve production canonical tags — duplicate content pointing at the apex.
Either delete its server block, or make it redirect:

```nginx
server {
    listen 80;
    server_name demo.thenailroomlashbeauty.com;
    return 301 https://thenailroomlashbeauty.com$request_uri;
}
```

### 6. Verify, then remove WordPress

```bash
curl -sI https://thenailroomlashbeauty.com | head -1                    # 200
curl -sI https://www.thenailroomlashbeauty.com | head -1                # 301
curl -s  https://thenailroomlashbeauty.com/robots.txt                   # Allow: /
curl -sI https://thenailroomlashbeauty.com/wp-content/uploads/2026/02/nails.jpg | head -2
curl -sI https://thenailroomlashbeauty.com/about-us/ | head -2          # 308 -> /about-us
curl -sI https://thenailroomlashbeauty.com/wp-admin | head -1           # 410
```

Only once these pass, delete the WordPress directory and database.

Finally, in Google Search Console submit
`https://thenailroomlashbeauty.com/sitemap.xml`. The old Rank Math sitemaps
(`/sitemap_index.xml`, `/page-sitemap.xml`) redirect to it.

### If the domain is behind Cloudflare

**Purge the cache after the cutover.** The WordPress server sent
`Cache-Control: max-age=315360000` with its assets, so Cloudflare keeps serving
the old `/wp-content/...` files from the edge for years and the new redirects
never get a chance to run. The origin can be completely correct while the site
still looks half-migrated. Dashboard → Caching → Configuration → Purge
Everything, then confirm:

```bash
curl -sI https://thenailroomlashbeauty.com/wp-content/uploads/2026/02/nails.jpg | head -3
```

Expect `301` with a `location:` of `/images/2026-02-nails.jpg`. A `200` with
`cf-cache-status: HIT` means the purge has not taken effect. Adding a dummy
query string (`?x=1`) bypasses the cache and shows what the origin really says.

**Do not enable "Cache Everything" for HTML.** Next.js serves prerendered pages
with `Cache-Control: s-maxage=31536000`. Cloudflare honours that, so with a
Cache Everything page rule the edge would hold every page for a year: the salon
would save a change in `/admin`, the origin would regenerate correctly, and
visitors would keep seeing the old page indefinitely. By default Cloudflare
caches only static assets and leaves HTML alone (`cf-cache-status: DYNAMIC`),
which is what this app needs.

Cloudflare also injects its own managed block into `robots.txt` above the app's.
Its `Disallow` rules target AI crawlers (GPTBot, ClaudeBot, Google-Extended);
none of them affect Google Search indexing.

### What the old URLs do now

| Old WordPress URL | Now |
| --- | --- |
| `/about-us/` and every other trailing slash | 308 to the same path without the slash (Next.js does this) |
| `/wp-content/uploads/2026/02/nails.jpg` | 301 to `/images/2026-02-nails.jpg` |
| `/wp-content/uploads/2026/03/IMG_6550-1024x683.jpeg` | 301 to the full-size `/images/2026-03-IMG_6550.jpeg` |
| `/sitemap_index.xml`, `/page-sitemap.xml` | 301 to `/sitemap.xml` |
| `/wp-admin`, `/xmlrpc.php`, `/feed`, `/wp-json` | 410 Gone |

The media rules matter: those image URLs are indexed and may be linked from
Instagram and Facebook posts. Letting them 404 throws away that traffic.

## Deploying an update

```bash
cd /var/www/thenailroom
sudo -u www-data git pull
sudo -u www-data npm ci
sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env npm run deploy:build
sudo systemctl restart thenailroom
```

Content and uploads are untouched — they live outside the checkout.

## Backups

Everything the salon owns lives outside the checkout, so one command captures
it all:

```bash
cd /var/www/thenailroom
sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env \
     npm run content:export -- /var/backups/thenailroom-$(date +%F).tar.gz
```

Back that up on a schedule. The checkout itself is disposable — `git clone`
rebuilds it.

## Moving to another server

`content/` and `uploads/` are **not in git**. A fresh `git clone` gives you the
default content that shipped with the repo, not what the salon has edited, and
none of the images they uploaded. Both must be carried over by hand, and they
must travel together: content references uploads by path, so moving one without
the other leaves broken images on the live site.

On the old server:

```bash
cd /var/www/thenailroom
sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env \
     npm run content:export -- /tmp/thenailroom-content.tar.gz
```

Copy it across, then on the new server — after steps 1–4 of this guide:

```bash
scp /tmp/thenailroom-content.tar.gz newserver:/tmp/

cd /var/www/thenailroom
sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env \
     npm run content:import -- /tmp/thenailroom-content.tar.gz --force

sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env npm run content:check
```

`content:import` refuses to overwrite a populated destination unless `--force`
is given, and even then it renames the existing directories to
`<dir>.bak-<timestamp>` instead of deleting them.

`content:check` walks every content file, collects each `/images/...` and
`/uploads/...` reference, and confirms the file is actually on disk. Run it
after any migration — it is what catches a forgotten uploads directory before
visitors do.

Then rebuild, because pages are prerendered from the content:

```bash
sudo -u www-data node scripts/with-env.mjs /etc/thenailroom.env npm run deploy:build
sudo systemctl restart thenailroom
```

Remember to update `SITE_URL` in `/etc/thenailroom.env` if the domain changed.

### Content commands

| Command                                           | What it does                                                  |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `npm run content:init`                          | Seeds`CONTENT_DIR` from the repo defaults; never overwrites |
| `npm run content:export -- out.tar.gz`          | Bundles content + uploads into one archive                    |
| `npm run content:import -- in.tar.gz [--force]` | Restores an archive                                           |
| `npm run content:check`                         | Verifies every referenced image exists                        |

All four read `CONTENT_DIR` and `UPLOAD_DIR` from the environment.

## Troubleshooting

| Symptom                              | Cause                                                          |
| ------------------------------------ | -------------------------------------------------------------- |
| `413` when uploading in `/admin` | `client_max_body_size` missing from the nginx server block   |
| `502 Bad Gateway`                  | the Node service is down —`journalctl -u thenailroom -n 50` |
| Sign-in fails immediately            | `ADMIN_SESSION_SECRET` unset or shorter than 16 characters   |
| Admin edits vanish after a deploy    | `CONTENT_DIR` still points inside the checkout               |
| Uploaded images 404                  | `UPLOAD_DIR` not writable by the service user                |
| Demo appears in Google               | `SITE_NOINDEX` not set to `1`                              |
