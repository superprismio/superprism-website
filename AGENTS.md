# Repository Guidelines

## Project Structure & Module Organization
- `app/` houses Next.js App Router routes, layouts, and API route handlers (for example `app/api/heaps/[heapId]/route.ts`).
- `components/` contains shared UI and feature components, with shadcn-style primitives under `components/ui/`.
- `lib/` holds shared utilities and Supabase helpers; `hooks/` contains React hooks.
- `public/` stores static assets (images, favicon). `docs/` includes domain notes and guides.
- `scripts/` includes one-off tooling such as `scripts/send-invites.ts`.

## Build, Test, and Development Commands
- `npm run dev`: start the Next.js dev server with Turbopack.
- `npm run build`: create a production build.
- `npm run start`: run the production server after a build.
- `npm run lint`: run ESLint across the repo.
- `npm run send-invites`: execute the invite script via `tsx`.

## Architecture & Integrations
- Supabase auth is enforced via middleware plus explicit checks in API routes; use `getClaims()` in server components and `getUser()` in API handlers.
- Choose Supabase clients by context: `lib/supabase/client.ts` for client components, `lib/supabase/server.ts` for server/API, and service role only for RLS bypass.
- Ingestion routes live under `/api/heaps/[heapId]/injest/*` and forward to an n8n webhook; follow the existing FormData/JSON shapes.
- Theming uses CSS tokens in `app/globals.css` wired into Tailwind in `tailwind.config.ts`, with shadcn/ui variants and `next/font` variables.

## Coding Style & Naming Conventions
- TypeScript/React code is in `*.ts`/`*.tsx`; use 2-space indentation as seen in `app/`.
- Use PascalCase for React components and camelCase for hooks/utilities.
- Tailwind CSS is the primary styling approach; prefer class-based styling in JSX.
- Linting is enforced via `eslint.config.mjs`; keep code ESLint-clean.

## Testing Guidelines
- No automated test framework is configured yet.
- If you add tests, keep them close to their modules (for example `components/feature/__tests__/...`) and document how to run them in this file.

## Commit & Pull Request Guidelines
- Recent commit history uses short, imperative summaries without strict conventional prefixes; follow that style unless the team says otherwise.
- PRs should include a concise description, linked issue/ticket if applicable, and screenshots for UI changes.
- Note any environment or migration steps in the PR description.

## Security & Configuration Tips
- Create `.env.local` from `.env.example` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Avoid committing secrets; keep all credentials in env files.
