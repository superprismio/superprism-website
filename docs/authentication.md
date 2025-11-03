# Supabase Authentication Guide

This document outlines how Supabase authentication works in this application, including how pages and API routes are protected, and when authentication checks are necessary.

## Overview

The application uses Supabase Auth with Next.js middleware for session management. Authentication is handled at multiple layers:

1. **Middleware Layer** - Protects pages by redirecting unauthenticated users
2. **Server Components** - Verify authentication for server-rendered pages
3. **API Routes** - Explicitly check authentication for API endpoints

## Architecture

### Authentication Flow

```
User Request
    ↓
Next.js Middleware (proxy.ts)
    ↓
updateSession() - Refreshes session, checks auth
    ↓
Page/Route Handler
    ↓
Server Component / API Route
    ↓
Explicit Auth Check (if needed)
```

## Middleware Protection

The middleware (`lib/supabase/middleware.ts`) runs on **every request** and handles session refresh and basic page protection.

### How It Works

```40:53:lib/supabase/middleware.ts
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }
```

**Key Points:**

- ✅ Refreshes user sessions automatically via `getClaims()`
- ✅ Redirects unauthenticated users from pages (not API routes)
- ✅ Allows access to `/`, `/login`, and `/auth/*` paths without authentication
- ⚠️ **Does NOT protect API routes** - API routes bypass middleware redirects

### What Middleware Protects

- ✅ **Pages** (e.g., `/dashboard`, `/heaps/[heapId]`)
- ❌ **API Routes** (e.g., `/api/heaps/*`) - Middleware doesn't block these

## API Route Protection

**IMPORTANT:** Middleware does NOT automatically protect API routes. You must explicitly check authentication in each API route handler.

### Why Manual Checks Are Needed

API routes handle authentication differently than pages:

- Middleware redirects don't apply to API requests (they return JSON, not redirects)
- API routes need to return proper HTTP status codes (401, 403)
- You may need the user object for authorization checks

### Standard Authentication Pattern

For routes that require authentication, use this pattern:

```typescript
const supabase = await createClient();

// Verify user is authenticated
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Example: Protected POST Route

```27:45:app/api/heaps/[heapId]/tags/route.ts
  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is a heap member
  const { data: isMember, error: memberError } = await supabase.rpc("is_heap_member", {
    p_heap_id: heapId,
  });
  if (memberError || !isMember) {
    return NextResponse.json(
      { error: "You must be a member of this heap to add tags" },
      { status: 403 }
    );
  }
```

### When to Skip Auth Checks

You can skip explicit authentication checks in API routes when:

1. **Public endpoints** - Data that should be accessible without auth
2. **GET requests that use RLS** - Row Level Security policies handle protection
3. **Routes that don't expose sensitive data**

**Example:** A GET route that uses Supabase RLS:

```6:16:app/api/heaps/[heapId]/tags/route.ts
export async function GET(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kb_tags")
    .select("*")
    .eq("heap_id", heapId)
    .order("label", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
```

However, **even with RLS, it's often better to check auth explicitly** to:

- Provide clear error messages
- Avoid ambiguous 400 vs 401 status codes
- Have the user object available for authorization logic

## Server Component Protection

Server components should check authentication using `getClaims()`:

```9:12:app/dashboard/page.tsx
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }
```

**Note:** `getClaims()` is preferred over `getUser()` in server components because it's what middleware uses to refresh sessions.

## Client Components

Client components use the browser client (`lib/supabase/client.ts`) and typically check authentication state reactively via hooks or components.

## Authentication Methods Comparison

### `getUser()` vs `getClaims()`

| Method        | Use Case                                   | Returns                           |
| ------------- | ------------------------------------------ | --------------------------------- |
| `getUser()`   | API routes, when you need full user object | Full user object with metadata    |
| `getClaims()` | Server components, middleware              | JWT claims (user ID, email, etc.) |

**Why the difference?**

- `getClaims()` is used in middleware to refresh sessions (prevents logout issues)
- `getUser()` provides the complete user object needed in API routes
- Both validate the session, but `getClaims()` is optimized for session refresh

## Best Practices

### For API Routes

1. **Always check auth for write operations** (POST, PATCH, DELETE)

   ```typescript
   const {
     data: { user },
     error,
   } = await supabase.auth.getUser();
   if (error || !user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```

2. **Check auth for read operations** unless the data is truly public

   - Even with RLS, explicit checks provide better error messages
   - You'll often need the user object anyway (e.g., for filtering by user)

3. **Use proper HTTP status codes**

   - `401 Unauthorized` - Not authenticated
   - `403 Forbidden` - Authenticated but not authorized (e.g., not a heap member)

4. **Don't rely solely on middleware** for API route protection
   - Middleware redirects don't apply to API routes
   - Always verify in the route handler itself

### For Server Components

1. Use `getClaims()` (matches middleware pattern)
2. Redirect to login if not authenticated
3. Use `redirect()` from `next/navigation` for server components

### Using Auth Helpers

We've created reusable auth helpers in `lib/auth-helpers.ts` to reduce duplication and standardize authentication checks across routes.

#### `requireAuth(supabase)`

Verifies that a user is authenticated. Returns the user object if authenticated, or a 401 response if not.

```typescript
import { requireAuth } from "@/lib/auth-helpers";

const supabase = await createClient();
const authResult = await requireAuth(supabase);

if (!authResult.success) {
  return authResult.response; // Returns 401 Unauthorized
}

const { user } = authResult; // User is authenticated
// Continue with route logic...
```

#### `requireHeapMember(supabase, heapId, errorMessage?)`

Verifies that a user is authenticated AND is a member of the specified heap. Returns the user object if authorized, or an error response (401 or 403) if not.

```typescript
import { requireHeapMember } from "@/lib/auth-helpers";

const supabase = await createClient();
const { heapId } = await params;

const authResult = await requireHeapMember(
  supabase,
  heapId,
  "You must be a member of this heap to perform this action"
);

if (!authResult.success) {
  return authResult.response; // Returns 401 or 403
}

const { user } = authResult; // User is authenticated and is a heap member
// Continue with route logic...
```

#### Example: Using in a Route

Here's how the tags route uses `requireHeapMember`:

```26:36:app/api/heaps/[heapId]/tags/route.ts
  const supabase = await createClient();

  // Verify user is authenticated and is a heap member
  const authResult = await requireHeapMember(
    supabase,
    heapId,
    "You must be a member of this heap to add tags"
  );
  if (!authResult.success) {
    return authResult.response;
  }
```

## Security Considerations

1. **Never trust client-side auth state** - Always verify on the server
2. **Use RLS policies** in Supabase for database-level protection (defense in depth)
3. **Validate authorization** - Authentication (who you are) is different from authorization (what you can do)
4. **API routes are public endpoints** - Treat them as such unless you explicitly check auth

## Summary

- ✅ **Middleware protects pages** by redirecting unauthenticated users
- ⚠️ **Middleware does NOT protect API routes** - you must check auth explicitly
- ✅ **Always check authentication in API routes** that modify data or access sensitive information
- ✅ **Use `getUser()` in API routes** when you need the full user object
- ✅ **Use `getClaims()` in server components** to match middleware behavior
- ✅ **Consider RLS** for database-level protection, but don't rely solely on it

The authentication check code in routes **is necessary** because middleware doesn't protect API routes. We use reusable auth helpers (`lib/auth-helpers.ts`) to reduce code duplication and standardize authentication checks across routes.
