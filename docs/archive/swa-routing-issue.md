> Archived 2026-04-19. Root cause ultimately tracked to tsconfig.json api/ exclusion (see BTAISite#16), NOT the SSG routing hypothesis in this doc. Kept for historical investigative reference.

# Azure SWA Routing Issue: Privacy & Terms Pages

## The Problem

The `/privacy` and `/terms` pages render correctly in local dev but return the homepage content on the deployed Azure Static Web Apps staging site. Clicking footer links to Privacy or Terms loads the main page instead.

## Root Cause

Azure SWA with `skip_app_build: true` and `output_location: ".next"` treats the deployment as a static site with its own internal Next.js handler. However, this handler does NOT properly serve SSG pages from `.next/server/app/`. Instead:

1. Any route not matching a physical static file hits the `navigationFallback`
2. The fallback rewrites to `/index.html`
3. `/index.html` loads the Next.js client-side router
4. The `[locale]` dynamic route catches the path (e.g., `privacy` becomes `locale="privacy"`) and renders `HomePageContent`

## What We Have

### Build output
- Next.js **does** generate full static HTML for these pages:
  - `.next/server/app/privacy.html` (from `app/privacy/page.tsx`)
  - `.next/server/app/en/privacy.html` (from `app/[locale]/privacy/page.tsx`)
  - Same for terms
- These are complete, valid HTML files with correct `<title>` and content
- But SWA's Next.js integration doesn't serve them — it only recognizes routes through its own routing layer

### Current deployment config
```yaml
# .github/workflows/cost-optimized-ci.yml
- uses: Azure/static-web-apps-deploy@v1
  with:
    app_location: "/"
    output_location: "deploy_output"  # was ".next"
    skip_app_build: true
```

### SWA static config
```json
// staticwebapp.config.json
"navigationFallback": {
  "rewrite": "/index.html",
  "exclude": [
    "/*.{js,css,ico,...}",
    "/en/privacy", "/en/terms", ...
  ]
}
```

### Why we can't use Oryx build
Letting SWA's Oryx builder handle the Next.js build (`skip_app_build: false`) fails because:
- `npm ci` with engine-strict fails: `@cyclonedx/cyclonedx-npm` requires npm 6-9, but Node 20.19.1 ships with npm 10
- The project uses `npm ci --engine-strict=false` to work around this, which Oryx doesn't do

### Why we can't use `output: 'export'`
- API routes (`app/api/contact/route.ts`, etc.) use `NextRequest`/`NextResponse`
- Next.js static export (`output: 'export'`) doesn't support API routes
- The contact form depends on the API route for email delivery

## What We Tried

1. **Changed `<Link>` to `<a>` tags** — Forces full page navigation instead of client-side routing. Didn't help on SWA because the server-side routing is the issue, not client-side.

2. **Moved pages under `app/[locale]/`** — Privacy/terms now also exist at `app/[locale]/privacy/page.tsx` so `generateStaticParams` produces HTML at `/en/privacy`. HTML files ARE generated but SWA still doesn't serve them.

3. **Excluded paths from `navigationFallback`** — Added `/en/privacy`, `/en/terms` to the exclude list. These paths no longer fall back to `index.html`, but since SWA doesn't find a static file at those paths either, the result is a 404 or the homepage depending on caching.

4. **Copied SSG HTML into `.next/` directory** — Post-build step copies `.next/server/app/en/privacy.html` to `.next/en/privacy/index.html`. SWA uploads the files but its internal routing ignores them.

5. **Created `deploy_output/` assembly directory** — Copies `.next/*` plus SSG HTML files into a single directory. Changed `output_location` to `deploy_output`. Same result — SWA's routing layer doesn't serve the extra HTML files.

6. **Removed `skip_app_build`** — Let Oryx detect and build Next.js natively. Failed immediately due to npm engine-strict incompatibility.

## Proposed Next Steps

### Option A: Static HTML in `public/` directory (Simplest)
Put pre-built HTML files for privacy and terms directly in `public/en/privacy/index.html` and `public/en/terms/index.html`. Next.js copies `public/` contents to the build output root, so SWA should serve them as plain static files.

- **Pro**: Simple, no CI changes needed, files are just in the repo
- **Con**: HTML content is duplicated (source in .tsx AND pre-built in public/), need to keep them in sync

### Option B: Post-build script copies to `public/` before deploy
Keep the .tsx source files as the single source of truth. Add a CI step that:
1. Builds Next.js normally
2. Copies the generated HTML from `.next/server/app/` to `public/en/privacy/index.html`
3. Then deploys

- **Pro**: Single source of truth
- **Con**: Still need to re-run the deploy action or restructure the output

### Option C: Fix the Oryx build
Add an `.npmrc` with `engine-strict=false` to the repo so Oryx's `npm ci` doesn't fail. Then remove `skip_app_build` and let SWA handle Next.js hybrid rendering natively.

- **Pro**: Proper hybrid rendering — all SSG/SSR pages work correctly, future pages just work
- **Con**: Longer deploy times (Oryx rebuilds from scratch), less control over the build process

### Option D: Use Next.js `output: 'standalone'` mode
Configure `output: 'standalone'` in `next.config.js`. This produces a self-contained Node.js server. Azure SWA's managed functions might be able to run this.

- **Pro**: Full Next.js routing including API routes and SSG pages
- **Con**: May not be compatible with Azure SWA's static hosting model; might need Azure App Service instead

### Recommendation
**Option C** (fix Oryx build) is the most robust long-term solution. Adding `engine-strict=false` to `.npmrc` is a one-line fix. If Oryx can build the Next.js app itself, it will set up the hybrid rendering adapter that correctly serves SSG pages, API routes, and dynamic routes.

**Option A** (static HTML in public/) is the fastest fix if you need this working immediately.
