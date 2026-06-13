# Superprism Website

This repository contains the public Superprism marketing site. It is a Next.js App Router project focused on the main landing page, supporting brand pages, and contact capture.

## What Is Here

- Public landing page at `/`, assembled from sections in `components/home/`.
- Lightweight `/about` route.
- Shared site chrome in `components/shared/`, including the header, footer, contact modal, loader, and early-access form.
- Discord-backed contact API at `app/api/contact/route.ts`.
- Static brand and product imagery in `public/images/`.
- shadcn-style UI primitives in `components/ui/`.

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI and shadcn-style components
- React Query for client-side route mutations

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the required Discord notification values:

```env
DISCORD_BOT_TOKEN=
DISCORD_CONSULTATION_CHANNEL_ID=
```

Optional values used by specific features:

```env
APP_URL=your-production-domain.com
NEXT_PUBLIC_SIGNUP_PAUSED=false
```

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

## Project Structure

```text
app/
  page.tsx                  Main landing page
  about/page.tsx            About route
  api/contact/route.ts      Contact and early-access lead endpoint
components/
  home/                     Landing-page sections
  shared/                   Header, footer, forms, modal, shared chrome
  ui/                       Reusable UI primitives
hooks/                      React Query route hooks
lib/
  types/                    Generated and local TypeScript types
public/images/              Static imagery and favicon assets
```

## Contact Flow

The early-access and contact forms submit through a React Query mutation hook to `/api/contact`. The route validates the payload, formats a Discord message, and posts the lead into the configured Discord channel.

## Development Notes

- Keep direct API calls out of React components. Wrap route calls in hooks when adding new client-side data flows.
- Use Tailwind classes and the existing design tokens in `app/globals.css`.
- Keep public assets under `public/images/`.
- No automated test framework is currently configured; use `npm run lint` and `npm run build` before shipping changes.
