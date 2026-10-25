# Kenna Ventures

Kenna Ventures ("Powering Smarter Business Decisions") is a platform by Erudite Africa Investments PLC that connects Ethiopian entrepreneurs, businesses and investors across the full business lifecycle: incubation, investment, diagnostics, recovery, credit management and learning.

This repository will hold the whole platform, following the Kenna Ventures Requirement Specification v0.3 (Next.js front end, NestJS + PostgreSQL back end, hosted on Azure).

## Layout

| Path | What it is |
| --- | --- |
| `apps/web` | Public website and, later, the signed-in app. Next.js (App Router), React, TypeScript, Tailwind CSS. |
| `apps/api` | Planned: NestJS API with PostgreSQL. |

## Run the website locally

```bash
cd apps/web
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Hosting

The public site is exported as static files (`apps/web/out`) and deployed to Azure Static Web Apps by `.github/workflows/web.yml`. Deployment starts once the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN` is set: pushes to `main` update the preview site, and each pull request gets its own temporary preview URL.

## Status of the public site

- Every public page from the approved website copy (Kenna Ventures Website Content v1.0) is built, in US English.
- Anything that still needs a real fact is shown on the page as a highlighted **[TBC: …]** marker. Search the code for `<Tbc` to list them. None may go live unresolved.
- Lists that will come from the platform (listings, investors, programs, mentors, events, deal rooms) show their empty states. No sample data is invented.
- Forms are previews: they show their confirmation message but send nothing until the API exists.
- The site sets `noindex` so previews stay out of search engines. Remove it in `apps/web/src/app/layout.tsx` at launch.
- Amharic is shown in the language switch as coming soon; the structure is ready for translation.
- Brand colors and the "E" logo mark are working defaults until Erudite Africa supplies brand guidelines.
