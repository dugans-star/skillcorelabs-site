# Cloudflare Pages Deploy

## Project

Project name: `skillcorelabs-site`

Production branch: `main`

Framework preset: `None`

Build command: leave blank

Output directory: `deploy/live-site`

Canonical site path: `/Users/levim4pro/Documents/Trashcan/Sites/skillcorelabs.com`

## Site Type

The Skill Core Labs website is plain static HTML/CSS/JS. No package manager, framework build, or generated build directory is required for the current site.

The clean publish directory is `/Users/levim4pro/Documents/Trashcan/Sites/skillcorelabs.com/deploy/live-site`, which contains the static site files Cloudflare Pages should serve. Treat this folder as generated output only. Do not manually maintain both the source files and `deploy/live-site`.

Regenerate the Cloudflare output with:

```bash
cd /Users/levim4pro/Documents/Trashcan/Sites/skillcorelabs.com
./scripts/prepare-cloudflare-deploy.sh
```

## Manual Cloudflare Dashboard Steps

1. Open Cloudflare Dashboard.
2. Go to Workers and Pages.
3. Select Create application.
4. Choose Pages.
5. Choose Connect to Git.
6. Select the repository that contains this site.
7. Set Project name to `skillcorelabs-site`.
8. Set Production branch to `main`.
9. Set Framework preset to `None`.
10. Leave Build command blank.
11. If the connected Git repository root is `/Users/levim4pro/Documents/Trashcan`, set Output directory to `Sites/skillcorelabs.com/deploy/live-site`. If the repository root is the site folder itself, set Output directory to `deploy/live-site`.
12. Deploy and wait for the Cloudflare Pages preview URL.
13. Verify the preview URL before connecting any custom domain.

## Custom Domain Plan

First verify the Cloudflare Pages preview URL.

Only after explicit approval, connect:

- `skillcorelabs.com`
- `www.skillcorelabs.com`

## DNS Warning

Do not change GoDaddy DNS yet.

Do not change Cloudflare DNS yet.

Do not point `skillcorelabs.com` or `www.skillcorelabs.com` away from Netlify until the Cloudflare Pages preview URL is verified and approved.

## Later DNS Records

Cloudflare Pages will provide the exact custom-domain routing instructions after the preview deployment is verified and the custom domains are added in Cloudflare Pages.

Use only the DNS values Cloudflare provides at that time. Preserve all existing email DNS records, including MX, SPF, DKIM, DMARC, verification, and security records.

## Wrangler

Wrangler was not used for this readiness step because the local environment did not expose a `wrangler` command and no Cloudflare credential environment flags were present.

If Wrangler is later configured, use a preview deployment first:

```bash
npx wrangler pages deploy deploy/live-site --project-name skillcorelabs-site
```

Do not perform a production DNS cutover from this command.
