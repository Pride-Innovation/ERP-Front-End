# Deploying the frontend

How to release a new version of the ERP frontend to the Ubuntu server (`prdevsvr1`), served at
`https://erptest.pride.co.ug` behind the F5 firewall (WAF).

The short version, for a routine release:

```bash
cd /var/www/html/ERP-Front-End
sudo npm run build          # 1. build in place
# 2. pin the bundle name    — see "Step 3", always required
# 3. fix permissions        — see "Step 4"
# 4. verify                 — see "Step 5"
```

Read the rest at least once. Step 3 is the one that is easy to forget, and forgetting it takes the
whole application down.

---

## How the server is laid out

| | |
|---|---|
| Source and build | `/var/www/html/ERP-Front-End` |
| Live site (Apache `DocumentRoot`) | `/var/www/html/ERP-Front-End/build` |
| Apache vhost | `/etc/apache2/sites-available/erp-application.conf` |
| Backend | `/var/www/html/ERP-Back-End`, proxied by Apache at `/api/v1/` |

The frontend is **built on the server, in place**. `build/` is not copied from anywhere — it *is*
the live site. That matters for two of the rules below.

The frontend folder on the server is **not a git repository**. Changed source files have to be copied
onto the server (or patched there) before building.

---

## One-time setup

These are already done on `prdevsvr1`. Check them when setting up a new server, or if something
behaves strangely.

### `.env.production`

The production build must send API calls to the same origin, not to `localhost`:

```bash
cd /var/www/html/ERP-Front-End
printf 'REACT_APP_BASE_URL=/api/v1/\n' | sudo tee .env.production
cat .env.production
```

**This file is in `.gitignore`**, so it never arrives with the source. If it is missing, `npm run
build` silently falls back to `.env`, which points at `http://localhost:7777/api/v1/`, and every
API call fails in the browser.

### Apache: the bundle must always be revalidated

Inside the `<Directory /var/www/html/ERP-Front-End/build>` block of `erp-application.conf`:

```apache
        # The entry bundle has a PINNED filename (main.547ca48f.js) so the firewall exception,
        # which is scoped to that exact URL, cannot lapse when we deploy. Without a content hash a
        # browser cannot tell the bundle changed, so it must revalidate on every load - ETag and
        # Last-Modified make that a cheap 304 when nothing has changed.
        <FilesMatch "^main\..*js$">
            Header set Cache-Control "no-cache, must-revalidate"
        </FilesMatch>
```

```bash
sudo apachectl configtest && sudo systemctl reload apache2
```

Without this, users keep running the **old** application after a release, with nothing to tell them
so. See [Why the bundle name is pinned](#why-the-bundle-name-is-pinned).

---

## Releasing a new version

### Step 1 — Get the changed source onto the server

Copy the changed files into `/var/www/html/ERP-Front-End/src/...` (or apply the patch you were
given). Then confirm a line you expect from the change is actually there, for example:

```bash
cd /var/www/html/ERP-Front-End
grep -c "something only the new code contains" src/path/to/changed/file.tsx   # expect 1 or more
```

Building without the change in place produces exactly the same bundle as before, and the release
silently does nothing.

### Step 2 — Build

```bash
cd /var/www/html/ERP-Front-End
sudo npm run build
```

**Do not delete `build/` first.** `npm run build` empties it itself, and `build/` is the live
site — deleting it takes the application down for the whole build, and has destroyed a fresh build
once already.

You are looking for:

- `Compiled successfully.`
- a file list containing a new `build/static/js/main.<hash>.js`

Two warnings are normal and can be ignored: `Browserslist: caniuse-lite is outdated`, and
`The bundle size is significantly larger than recommended`.

**If the build fails, stop here.** There is nothing new to pin.

### Step 3 — Pin the bundle name (always)

Every build gives the main bundle a new name, such as `main.9fc0642d.js`. The firewall only lets one
exact name through: **`main.547ca48f.js`**. This step renames the new bundle to that name and points
`index.html` at it.

```bash
cd /var/www/html/ERP-Front-End/build

PIN=main.547ca48f.js
HASHED=$(cd static/js && ls main.*.js 2>/dev/null | head -1)
echo "found: $HASHED    pinning to: $PIN"

if [ -n "$HASHED" ] && [ "$HASHED" != "$PIN" ]; then
    sudo mv "static/js/$HASHED" "static/js/$PIN"
    [ -f "static/js/$HASHED.LICENSE.txt" ] && \
        sudo mv "static/js/$HASHED.LICENSE.txt" "static/js/$PIN.LICENSE.txt"
    sudo sed -i "s|/static/js/$HASHED|/static/js/$PIN|g" index.html
    echo "pinned: $HASHED -> $PIN"
else
    echo "nothing to pin (already $PIN?)"
fi

cd ..
```

Check that `index.html` and the file on disk agree:

```bash
grep -o '/static/js/main[^"]*' build/index.html
ls build/static/js/ | grep '^main'
```

Both must show `main.547ca48f.js`, and no other `main.*.js` may be left over.

Only the main bundle is renamed. The other files (`52.48d3541d.chunk.js` and so on) keep their
names — the application loads them by those exact names, and renaming them would break it.

### Step 4 — Permissions

```bash
cd /var/www/html/ERP-Front-End
sudo chown -R root:root build
sudo find build -type d -exec chmod 755 {} \;
sudo find build -type f -exec chmod 644 {} \;
```

Apache must be able to read every file. A file it cannot read is answered with `index.html`
instead, which shows up in the browser as a blank page.

### Step 5 — Verify

```bash
cd /var/www/html/ERP-Front-End

# The bundle points at the right API and leaks nothing
grep -c "localhost:7777" build/static/js/main.*.js                              # expect 0
grep -o "/api/v1/"       build/static/js/main.*.js | head -1                     # expect /api/v1/
grep -c -E "\b10\.10\.[0-9]{1,3}\.[0-9]{1,3}\b" build/static/js/main.*.js        # expect 0

# Through the firewall
curl -sk "https://erptest.pride.co.ug/static/js/main.547ca48f.js" | head -c 40; echo
curl -sk "https://erptest.pride.co.ug/" | head -c 60; echo
```

The first `curl` should start with `/*! For license information please see ma` — JavaScript. The
second should start with `<!doctype html>`.

Then open `https://erptest.pride.co.ug/` in an **Incognito window** (or hard-reload with
**Ctrl+Shift+R**) and sign in.

---

## Troubleshooting

| What you see | What it means | What to do |
|---|---|---|
| Browser console: `Uncaught SyntaxError: Unexpected token '<' (at main.….js:1:1)` | The browser asked for a JavaScript file and got HTML back | Run the checks in Step 3 and Step 4. A missing or unreadable file is answered with `index.html` |
| The bundle `curl` returns `<html><head><title>Request Rejected</title>` | The firewall blocked the bundle | Step 3 was skipped, or the pinned name is wrong. Re-run Step 3. If it still fails, note the **support ID** in the response and give it to the F5/security team |
| Every API call fails, or the browser calls `localhost:7777` | The build did not read `.env.production` | Recreate `.env.production` (One-time setup) and rebuild |
| A release changed nothing on screen | The browser kept the old bundle, or the source change never reached the server | Hard-reload. Check the Apache cache header is in place, and re-check Step 1 |
| `chown: cannot access '…/build': No such file or directory` | `build/` was deleted | Run `sudo npm run build` again. Never delete `build/` before building |
| `index.html` refers to `main.547ca48f.js` but a second `main.*.js` is also on disk | The pin step was run twice, or interrupted | Delete the extra file, keep `main.547ca48f.js`, and re-check Step 3 |

---

## Why the bundle name is pinned

The firewall's Data Guard scan flags the main bundle's content (a long digit run inside the
compiled code reads to it like a card number). The security team created an exception, but it is
scoped to **one exact URL**: `/static/js/main.547ca48f.js`.

Create React App names the bundle after a hash of its contents, so every release produces a new
URL — which the exception does not cover, and the whole application would be blocked on the next
deploy. Renaming the bundle back to the exempted name after every build keeps it inside the
exception.

The cost is that the filename no longer changes when the contents do, so a browser cannot tell a
new release from the old one. That is what the Apache `Cache-Control: no-cache, must-revalidate`
rule is for.

**The better long-term fix** is for the security team to widen the exception to `/static/*`. When
that is in place:

1. Stop running Step 3.
2. Remove the `<FilesMatch "^main\..*js$">` block from the vhost and reload Apache.

Hashed filenames and normal browser caching then come back for every file.
