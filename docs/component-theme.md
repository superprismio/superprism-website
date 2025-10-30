# Tailwind + shadcn/ui Theming Guide

This app uses a hybrid theming approach that combines CSS custom properties (design tokens) with Tailwind utilities and shadcn/ui components. It provides strong themeability with minimal changes to component code.

## Core Philosophy

- **Use CSS Variables for**: semantic colors, typography scales, font families, radii, and other design tokens that may vary by theme.
- **Use Tailwind Utilities for**: layout, spacing, breakpoints, interaction states, and component composition.

## Architecture Overview

### 1) Design Tokens in CSS (`app/globals.css`)

Tokens are defined in `:root` and overridden per-theme via CSS classes such as `.dark` and `.brandA`.

```css
@layer base {
  :root {
    /* Colors (HSL channels; consumed as hsl(var(--token))) */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    /* ... other color tokens: card, popover, secondary, muted, accent, destructive, border, input, ring, chart-1..5 */

    /* Radius */
    --radius: 0.5rem;

    /* Typography sizes */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-4xl: 2.25rem;
    --text-5xl: 3rem;
    --text-6xl: 3.75rem;

    /* Line-height scale */
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --leading-loose: 2;

    /* Font family variables are set via next/font in layout.tsx */
    /* --font-sans, --font-serif, --font-mono */
  }

  .dark {
    /* Dark overrides for all color tokens */
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... */
  }

  .brandA {
    /* Example additional theme */
    --primary: 10 70% 45%;
    --secondary: 330 35% 92%;
    --radius: 0.625rem;
    --text-lg: 1.25rem; /* demonstrate per-theme typography change */
  }
}
```

### 2) Tailwind Configuration (`tailwind.config.ts`)

Tailwind maps utilities to tokens. Colors pull from HSL channels; typography and radii are read directly from variables.

```ts
export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
        "5xl": "var(--text-5xl)",
        "6xl": "var(--text-6xl)",
      },
      lineHeight: {
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
        loose: "var(--leading-loose)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        /* ... other semantic colors mapped similarly */
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### 3) Fonts via next/font (`app/layout.tsx`)

Fonts are loaded and exposed as CSS variables for theme-aware usage.

```tsx
import { Geist, Martian_Mono, Roboto, Rokkitt } from "next/font/google";

const roboto = Roboto({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});
const rokkitt = Rokkitt({
  variable: "--font-serif",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});
const martianMono = Martian_Mono({
  variable: "--font-mono",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

<body
  className={`${roboto.variable} ${rokkitt.variable} ${martianMono.variable} antialiased`}
>
  {/* ... */}
</body>;
```

### 4) Components (shadcn/ui + utilities)

Components use Tailwind utilities for layout/behavior and theme tokens for colors. Variants are implemented with `class-variance-authority`.

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```

## Best Practices

- **Keep tokens semantic**: prefer `--primary`, `--card-foreground` over hard-coded color values in components.
- **Utilities for layout**: continue to use Tailwind utilities for spacing, grid/flex, sizing, and responsive design.
- **Minimize Tailwind config**: map only what you use; push theming to CSS variables.
- **Theme-safe components**: use shadcn/ui patterns (variants + semantic classes) so components automatically respond to theme changes.
- **Typography via tokens**: use `text-*`, `leading-*`, and `font-*` utilities which are mapped to variables to enable per-theme typography.
- **Dark mode via class**: rely on the `.dark` class on `html` for dark mode switching.

## How-To Guides

### Add a New Theme

1. Define overrides in `app/globals.css`:

```css
@layer base {
  .my-theme {
    --primary: 250 70% 55%;
    --secondary: 280 25% 92%;
    --radius: 0.75rem;
    --text-lg: 1.2rem;
  }
}
```

2. Apply the theme at runtime:

```ts
// light theme override
document.documentElement.classList.add("my-theme");

// combine with dark, if desired
// document.documentElement.className = "my-theme dark";
```

### Adjust Component Styles Safely

- Prefer changing design tokens in CSS over editing component classes, so all components update consistently.
- For layout-specific changes, adjust Tailwind utilities locally (e.g., `p-6`, `gap-4`).

### Change Fonts

- Update fonts in `app/layout.tsx` using `next/font` and set the corresponding variables:

```tsx
const roboto = Roboto({ variable: "--font-sans" /* ... */ });
const rokkitt = Rokkitt({ variable: "--font-serif" /* ... */ });
const martianMono = Martian_Mono({ variable: "--font-mono" /* ... */ });
```

- Override per-theme if needed by redefining `--font-sans`/`--font-serif`/`--font-mono` in a theme class.

### Change Typography Scale

- Edit the token values in `:root` or a theme class (e.g., bump `--text-base` or adjust `--leading-normal`).
- Tailwind utilities (e.g., `text-base`, `leading-normal`) will pick up changes automatically.

### Add Per-Theme Adjustments

- Any token can be overridden in a theme class: colors, radii, text sizes, line-heights, or fonts.
- Keep per-theme overrides minimal and meaningful to avoid drift.

## Optional: OKLCH Migration

If you want perceptually uniform color theming:

- Switch Tailwind color consumption from `hsl(var(--token))` to direct variables.

```ts
colors: {
  primary: {
    DEFAULT: "var(--primary)";
  }
}
```

- Update CSS tokens to full color strings using OKLCH:

```css
:root {
  --primary: oklch(0.6 0.2 250);
}
```

This can be done incrementally per token.

## Utility Function

`cn()` combines `clsx` and `tailwind-merge` for deduplicating and merging classes. Prefer it when composing class strings.

## Benefits

- **Consistent theming**: centralized tokens drive color, typography, and radii across components.
- **Low-risk changes**: tokens update styles without touching component code.
- **Brandable**: add theme classes for new brands or campaigns.
- **Performance**: Tailwind utilities are optimized; `next/font` avoids render-blocking font loads.

## Checklist for New Components

- Use semantic color classes (e.g., `bg-card`, `text-primary-foreground`).
- Keep layout in utilities (spacing, flex/grid, responsive states).
- Export variant-driven components with cva where appropriate.
- Avoid hard-coded hex/HSL values in components.
- Test in light, dark, and at least one custom theme.
