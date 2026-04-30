# Superprism Website

This repository contains the public Superprism marketing site. It is a Next.js App Router project focused on the main landing page, supporting brand pages, and early-access signup capture.

## What Is Here

- Public landing page at `/`, assembled from sections in `components/home/`.
- Lightweight `/about` route.
- Shared site chrome in `components/shared/`, including the header, footer, contact modal, loader, and early-access form.
- Supabase-backed early-access API at `app/api/early-access/route.ts`.
- Static brand and product imagery in `public/images/`.
- shadcn-style UI primitives in `components/ui/`.
- Invite tooling in `scripts/send-invites.ts` for early-access signups.

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI and shadcn-style components
- Supabase for early-access signup storage and invite management

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the required Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Optional values used by specific features:

```env
APP_URL=your-production-domain.com
NEXT_PUBLIC_SIGNUP_PAUSED=false
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is only needed for administrative scripts such as sending invites. Do not expose or commit it.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
```

Runs the local Next.js dev server with Turbopack.

```bash
npm run build
```

Builds the production site.

```bash
npm run start
```

Starts the production server after a build.

```bash
npm run lint
```

Runs ESLint across the project.

```bash
npm run send-invites
```

Uses the Supabase service role key to invite records from the `early_signups` table that have not yet been marked as invited.

## Project Structure

```text
app/
  page.tsx                  Main landing page
  about/page.tsx            About route
  api/early-access/route.ts Early-access signup endpoint
components/
  home/                     Landing-page sections
  shared/                   Header, footer, forms, modal, shared chrome
  ui/                       Reusable UI primitives
lib/
  supabase/                 Supabase browser/server helpers
  types/                    Generated and local TypeScript types
public/images/              Static imagery and favicon assets
scripts/                    Operational scripts
```

## Early-Access Flow

The early-access form posts to `/api/early-access`. The route validates the email address, upserts the signup in Supabase's `early_signups` table, and invokes the `notify-early-signup` Supabase function for new records.

Invite sending is handled separately with `npm run send-invites`. The script reads `early_signups`, sends Supabase auth invites, and writes an `invitedAt` timestamp into each record's metadata.

## Development Notes

- Keep direct API calls out of React components. Wrap route calls in hooks when adding new client-side data flows.
- Use Tailwind classes and the existing design tokens in `app/globals.css`.
- Keep public assets under `public/images/`.
- No automated test framework is currently configured; use `npm run lint` and `npm run build` before shipping changes.
