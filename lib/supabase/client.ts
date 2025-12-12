"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components.
 * This client uses the browser's cookies to manage the session.
 * 
 * Use this in:
 * - Client Components ("use client")
 * - Browser-side code
 * - React hooks and event handlers
 * 
 * Do NOT use this in:
 * - Server Components
 * - API Routes
 * - Server Actions
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
