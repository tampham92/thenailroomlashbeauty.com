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

```bash
node -v          # needs 20.9+, 22 LTS recommended
nginx -v
```

Point DNS at the server before requesting a certificate:

```
demo.thenailroomlashbeauty.com.  A  <your server IP>
```

## 2. Directories and checkout

```bash
sudo mkdir -p /var/www /var/lib/thenailroom/{content,uploads}

sudo git clone https://github.com/tampham92/thenailroomlashbeauty.com.git \
     /var/www/thenailroom

sudo chown -R www-data:www-data /var/www/thenailroom /var/lib/thenailroom
```

A private repo needs credentials. Either use a deploy key, or `gh auth login`
as the deploying user.

## 3. Environment file

```bash
sudo cp /var/www/thenailroom/deploy/thenailroom.env.example /etc/thenailroom.env
sudo chmod 600 /etc/thenailroom.env
sudo nano /etc/thenailroom.env
```

Fill in:

```bash
ADMIN_PASSWORD=<the password the salon will type>
ADMIN_SESSION_SECRET=<openssl rand -base64 32>

CONTENT_DIR=/var/lib/thenailroom/content
UPLOAD_DIR=/var/lib/thenailroom/uploads

SITE_URL=https://demo.thenailroomlashbeauty.com
SITE_NOINDEX=1
PORT=3000
```

`SITE_NOINDEX=1` is important on the demo: it serves `robots.txt` with
`Disallow: /` and adds `noindex`, so this copy cannot compete with the real
site in search results. Remove it (or set `0`) only on the production host, and
set `SITE_URL` to the production domain there.

## 4. Build

```bash
cd /var/www/thenailroom
sudo -u www-data npm ci
sudo -u www-data --preserve-env=CONTENT_DIR,UPLOAD_DIR,SITE_URL,SITE_NOINDEX \
     env $(grep -v '^#' /etc/thenailroom.env | xargs) npm run deploy:build
```

`deploy:build` seeds `CONTENT_DIR` from the repo defaults (existing files are
never overwritten) and then runs `next build`. The build prerenders pages from
`CONTENT_DIR`, so seeding has to happen first.

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

## Deploying an update

```bash
cd /var/www/thenailroom
sudo -u www-data git pull
sudo -u www-data npm ci
sudo -u www-data env $(grep -v '^#' /etc/thenailroom.env | xargs) npm run deploy:build
sudo systemctl restart thenailroom
```

Content and uploads are untouched — they live outside the checkout.

## Backups

Everything the salon owns lives outside the checkout, so one command captures
it all:

```bash
cd /var/www/thenailroom
sudo -u www-data env $(grep -v '^#' /etc/thenailroom.env | xargs) \
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
sudo -u www-data env $(grep -v '^#' /etc/thenailroom.env | xargs) \
     npm run content:export -- /tmp/thenailroom-content.tar.gz
```

Copy it across, then on the new server — after steps 1–4 of this guide:

```bash
scp /tmp/thenailroom-content.tar.gz newserver:/tmp/

cd /var/www/thenailroom
sudo -u www-data env $(grep -v '^#' /etc/thenailroom.env | xargs) \
     npm run content:import -- /tmp/thenailroom-content.tar.gz --force

sudo -u www-data env $(grep -v '^#' /etc/thenailroom.env | xargs) \
     npm run content:check
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
sudo -u www-data env $(grep -v '^#' /etc/thenailroom.env | xargs) npm run deploy:build
sudo systemctl restart thenailroom
```

Remember to update `SITE_URL` in `/etc/thenailroom.env` if the domain changed.

### Content commands

| Command | What it does |
| --- | --- |
| `npm run content:init` | Seeds `CONTENT_DIR` from the repo defaults; never overwrites |
| `npm run content:export -- out.tar.gz` | Bundles content + uploads into one archive |
| `npm run content:import -- in.tar.gz [--force]` | Restores an archive |
| `npm run content:check` | Verifies every referenced image exists |

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
