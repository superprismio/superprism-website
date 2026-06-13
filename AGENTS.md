# Repository Guidelines

## Project Structure & Module Organization
- `app/` houses Next.js App Router routes, layouts, and API route handlers (for example `app/api/heaps/[heapId]/route.ts`).
- `components/` contains shared UI and feature components, with shadcn-style primitives under `components/ui/`.
- `lib/` holds shared utilities; `hooks/` contains React hooks.
- `public/` stores static assets (images, favicon). `docs/` includes domain notes and guides.
- `scripts/` is reserved for one-off tooling when needed.

## Build, Test, and Development Commands
- `npm run dev`: start the Next.js dev server with Turbopack.
- `npm run build`: create a production build.
- `npm run start`: run the production server after a build.
- `npm run lint`: run ESLint across the repo.

## Architecture & Integrations
- Contact submissions post to `/api/contact`, which forwards leads to Discord using `DISCORD_BOT_TOKEN` and `DISCORD_CONSULTATION_CHANNEL_ID`.
- Ingestion routes live under `/api/heaps/[heapId]/injest/*` and forward to an n8n webhook; follow the existing FormData/JSON shapes.
- Theming uses CSS tokens in `app/globals.css` wired into Tailwind in `tailwind.config.ts`, with shadcn/ui variants and `next/font` variables.

## API Call Pattern: Route > Hook > Component
- **Never make direct `fetch()` calls in components**. Always wrap API calls in React hooks using React Query (`@tanstack/react-query`).
- Create hooks in `hooks/` that use `useQuery` for GET requests and `useMutation` for POST/PATCH/DELETE requests.
- Hooks should handle error handling, caching, and query invalidation automatically.

## Coding Style & Naming Conventions
- TypeScript/React code is in `*.ts`/`*.tsx`; use 2-space indentation as seen in `app/`.
- Use PascalCase for React components and camelCase for hooks/utilities.
- Tailwind CSS is the primary styling approach; prefer class-based styling in JSX.
- Linting is enforced via `eslint.config.mjs`; keep code ESLint-clean.

## Adding Research Articles
- Store article Markdown files in `data/articles/` using the filename format `YYYYMMDD-slug.md`, for example `20260528-refactory-daohaus.md`.
- Every article must start with YAML front matter. The article page renders the title from front matter, so do not add a top-level `# H1` in the Markdown body.
- Use `status: "published"` for articles that should appear publicly and `status: "draft"` for work in progress.
- Valid `type` values are `research-report`, `case-study`, and `experiment-log`.
- Use lowercase kebab-case for `slug`; it becomes the `/research/[slug]` URL.
- Use ISO date strings in `YYYY-MM-DD` format. Keep the date aligned with the filename prefix.
- Keep `summary` to one or two concise sentences; it appears on the homepage, index page, article metadata, and social metadata.
- Use `tags` as a YAML list of short display labels.
- Use `featured: true` when the article should be eligible for the homepage Research Reports section.
- Article artwork should live under `public/images/articles/` and be referenced with an absolute public path such as `/images/articles/refactory-daohaus.png`.
- When generating article artwork, follow `docs/visual-guidelines.md`: dark optical/prismatic imagery, spectral light, clean technical composition, and no text, logos, people, UI mockups, or watermarks.

Recommended article front matter:

```yaml
---
title: "Article Title"
subtitle: "Optional short subtitle"
slug: "article-slug"
date: "YYYY-MM-DD"
type: "research-report"
status: "published"
summary: "One or two concise sentences that explain the report."
tags:
  - Superprism
  - Research
featured: false
image: "/images/articles/article-slug.png"
imageAlt: "Short accessible description of the article artwork"
---
```

Optional fields for case studies:

```yaml
client: "Client or project name"
product: "Relevant Superprism product"
```

Markdown body formatting:
- Start with the opening paragraph, not another title.
- Use `##` for major sections and `###` for subsections.
- Keep paragraphs short and scannable.
- Use standard Markdown lists for grouped points.
- Use inline links like `[Refactory](https://refactory.superprism.io/)` instead of bare URLs.
- Avoid raw HTML unless the article renderer explicitly supports the needed element.

## Testing Guidelines
- No automated test framework is configured yet.
- If you add tests, keep them close to their modules (for example `components/feature/__tests__/...`) and document how to run them in this file.

## Commit & Pull Request Guidelines
- Recent commit history uses short, imperative summaries without strict conventional prefixes; follow that style unless the team says otherwise.
- PRs should include a concise description, linked issue/ticket if applicable, and screenshots for UI changes.
- Note any environment or migration steps in the PR description.

## Security & Configuration Tips
- Create `.env.local` from `.env.example` and set Discord notification credentials.
- Avoid committing secrets; keep all credentials in env files.
