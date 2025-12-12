# Supabase Client Selection Guide

This document explains when to use each Supabase client type in your Next.js application.

## Overview

There are three Supabase client creation functions, each for different contexts:

1. **`createClient()` from `lib/supabase/client.ts`** - Browser client for Client Components
2. **`createClient()` from `lib/supabase/server.ts`** - Server client with user session
3. **`createServiceRoleClient()` from `lib/supabase/server.ts`** - Service role client that bypasses RLS

## Quick Decision Guide

**Are you in a Client Component (`"use client"`)?**
- ✅ Use `createClient()` from `lib/supabase/client.ts`

**Are you in a Server Component or API Route?**
- ✅ Use `createClient()` from `lib/supabase/server.ts` (for authenticated operations)
- ✅ Use `createServiceRoleClient()` from `lib/supabase/server.ts` (to bypass RLS)

## `createClient()` - Browser Client (Client Components)

**Location:** `lib/supabase/client.ts`

### What It Does

- Creates a Supabase client for use in the browser
- Uses browser cookies to manage the session
- **Respects Row-Level Security (RLS)** policies
- Has access to the authenticated user's context
- Uses the publishable key (safe for client-side use)

### When to Use

✅ **Always use in:**
- Client Components (files with `"use client"` directive)
- React event handlers (onClick, onSubmit, etc.)
- React hooks (useEffect, useState, etc.)
- Browser-side code

❌ **Never use in:**
- Server Components
- API Routes
- Server Actions

### Example

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const handleLogout = async () => {
    const supabase = createClient(); // ✅ Correct: Client Component
    await supabase.auth.signOut();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## `createClient()` - Server Client (Server Components / API Routes)

**Location:** `lib/supabase/server.ts`

### What It Does

- Creates a Supabase client using the user's session from cookies
- **Respects Row-Level Security (RLS)** policies
- Has access to the authenticated user's context via `auth.uid()`
- Uses the publishable key (safe for server-side use)
- Reads session from Next.js cookies

### When to Use

✅ **Always use for:**
- Server Components
- API Routes
- Server Actions
- Authentication checks (`requireAuth`, `requireHeapMember`)
- RPC functions that use `auth.uid()` internally
- Operations that should respect RLS policies
- Any operation where you need to know which user is making the request

### Example

```typescript
// ✅ Correct: Server Component or API Route
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient(); // Note: async/await
  const authResult = await requireAuth(supabase);
  const { data } = await authResult.supabase.rpc("create_invite", {
    target_heap_id: heapId,
    invite_email: email,
  });
}
```

## `createClient()` - Authenticated Client

### What It Does

- Creates a Supabase client using the user's session from cookies
- **Respects Row-Level Security (RLS)** policies
- Has access to the authenticated user's context via `auth.uid()`
- Uses the publishable key (safe for client-side use)

### When to Use

✅ **Always use for:**
- Authentication checks (`requireAuth`, `requireHeapMember`)
- RPC functions that use `auth.uid()` internally
- Operations that should respect RLS policies
- Any operation where you need to know which user is making the request

### Example

```typescript
// ✅ Correct: RPC function uses auth.uid()
const supabase = await createClient();
const authResult = await requireAuth(supabase);
const { data } = await authResult.supabase.rpc("create_invite", {
  target_heap_id: heapId,
  invite_email: email,
});
```

## `createServiceRoleClient()` - Service Role Client

**Location:** `lib/supabase/server.ts`

### What It Does

- Creates a Supabase client using the service role key
- **Bypasses Row-Level Security (RLS)** completely
- **No user context** - `auth.uid()` returns `null`
- Uses the service role key (keep secret, server-only)
- **Server-only** - Never use in Client Components

### When to Use

✅ **Use for:**
- Reading data that should be accessible without authentication
- Operations that need to bypass RLS (e.g., public invite lookups)
- Admin operations that need full database access
- When you've already verified auth separately and need to read data

⚠️ **Do NOT use for:**
- RPC functions that use `auth.uid()` (they'll get `null`)
- Operations that should respect user permissions
- As a replacement for proper authentication checks

### Example

```typescript
// ✅ Correct: Public invite lookup (no auth required)
const serviceClient = await createServiceRoleClient();
const { data: invite } = await serviceClient
  .from("invites")
  .select("*")
  .eq("token", token)
  .single();
```

## Common Patterns

### Pattern 1: Client Component Authentication

```typescript
"use client";

import { createClient } from "@/lib/supabase/client"; // ✅ Client-side

export function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    const supabase = createClient(); // ✅ No await needed
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };
}
```

### Pattern 2: Server Component / API Route Authentication

```typescript
import { createClient } from "@/lib/supabase/server"; // ✅ Server-side

export async function GET() {
  const supabase = await createClient(); // ✅ Note: await
  const authResult = await requireAuth(supabase);
  // ...
}
```

### Pattern 3: Check Auth, Then Use Service Role for Data Access

```typescript
// 1. Check authentication with createClient()
const supabase = await createClient();
const authResult = await requireAuth(supabase);
if (!authResult.success) {
  return authResult.response;
}

// 2. Use service role to read data (bypass RLS)
const serviceClient = await createServiceRoleClient();
const { data } = await serviceClient
  .from("invites")
  .select("*")
  .eq("heap_id", heapId);
```

### Pattern 4: Use Authenticated Client for RPC Functions

```typescript
// ✅ Correct: RPC uses auth.uid()
const supabase = await createClient();
const authResult = await requireHeapMember(supabase, heapId);
const { data } = await authResult.supabase.rpc("create_invite", {
  target_heap_id: heapId,
  invite_email: email,
});

// ❌ Wrong: Service role has no user context
const serviceClient = await createServiceRoleClient();
const { data } = await serviceClient.rpc("create_invite", {
  // This will fail because auth.uid() is null
});
```

### Pattern 5: Public Endpoints (No Auth Required)

```typescript
// ✅ Correct: Public invite lookup
const serviceClient = await createServiceRoleClient();
const { data: invite } = await serviceClient
  .from("invites")
  .select("*")
  .eq("token", token)
  .single();
```

## Decision Tree

```
Are you in a Client Component ("use client")?
├─ YES → Use createClient() from lib/supabase/client.ts
│   └─ No await needed, works in browser
│
└─ NO → Are you in a Server Component or API Route?
    ├─ YES → Do you need to check authentication?
    │   ├─ YES → Use createClient() from lib/supabase/server.ts
    │   │   └─ Does the RPC function use auth.uid()?
    │   │       ├─ YES → Use authenticated client from authResult
    │   │       └─ NO → Can use service role for data reads (after auth check)
    │   │
    │   └─ NO → Is this a public endpoint?
    │       ├─ YES → Use createServiceRoleClient() to bypass RLS
    │       └─ NO → Reconsider: Should this endpoint require auth?
    │
    └─ NO → You're in the wrong place! Use Client or Server Component
```

## Key Differences Summary

| Feature | `createClient()`<br/>(Client) | `createClient()`<br/>(Server) | `createServiceRoleClient()` |
|---------|-----------------|----------------------------|----------------------------|
| **Location** | `lib/supabase/client.ts` | `lib/supabase/server.ts` | `lib/supabase/server.ts` |
| **Context** | Client Components | Server Components / API Routes | Server Components / API Routes |
| **Async** | ❌ No (synchronous) | ✅ Yes (async/await) | ✅ Yes (async/await) |
| **User Context** | ✅ Has authenticated user | ✅ Has authenticated user | ❌ No user (`auth.uid()` = `null`) |
| **RLS** | ✅ Respects RLS policies | ✅ Respects RLS policies | ❌ Bypasses all RLS |
| **Key Type** | Publishable key | Publishable key | Service role key (secret) |
| **Use Case** | Browser auth, client-side ops | Server auth, RPC functions | Admin ops, public data, bypass RLS |
| **RPC with `auth.uid()`** | ✅ Works | ✅ Works | ❌ Returns `null` |
| **Session Management** | Browser cookies | Next.js cookies | No session |

## Best Practices

1. **Always check authentication first** with `createClient()` before using service role
2. **Use service role sparingly** - only when you need to bypass RLS
3. **Never use service role for RPC functions** that depend on `auth.uid()`
4. **Document why** you're using service role in code comments
5. **Prefer RLS policies** over service role when possible for better security

## Common Mistakes

### ❌ Mistake 1: Using Server Client in Client Component

```typescript
"use client";

// ❌ Wrong: Server client in Client Component
import { createClient } from "@/lib/supabase/server";

export function MyComponent() {
  const supabase = await createClient(); // ❌ Can't use await in Client Component
}
```

```typescript
"use client";

// ✅ Correct: Client client in Client Component
import { createClient } from "@/lib/supabase/client";

export function MyComponent() {
  const supabase = createClient(); // ✅ No await needed
}
```

### ❌ Mistake 2: Using Client Client in Server Component

```typescript
// ❌ Wrong: Client client in Server Component
import { createClient } from "@/lib/supabase/client";

export async function ServerComponent() {
  const supabase = createClient(); // ❌ Won't have proper server session
}
```

```typescript
// ✅ Correct: Server client in Server Component
import { createClient } from "@/lib/supabase/server";

export async function ServerComponent() {
  const supabase = await createClient(); // ✅ Proper server session
}
```

### ❌ Mistake 3: Using Service Role for RPC Functions

```typescript
// ❌ Wrong: RPC function needs auth.uid()
const serviceClient = await createServiceRoleClient();
const { data } = await serviceClient.rpc("create_invite", {
  // Will fail: auth.uid() is null
});
```

### ❌ Mistake 4: Using Service Role Instead of Auth Check

```typescript
// ❌ Wrong: Should check auth first
const serviceClient = await createServiceRoleClient();
const { data } = await serviceClient.from("memberships").select("*");
```

### ✅ Correct Approach

```typescript
// ✅ Correct: Check auth, then use service role if needed
const supabase = await createClient();
const authResult = await requireAuth(supabase);
if (!authResult.success) {
  return authResult.response;
}
// Now safe to use service role for data access
```

## Security Notes

- **Service role key is powerful** - it bypasses all security policies
- **Never expose service role key** - keep it in environment variables only
- **Always verify auth first** - don't use service role as a shortcut to skip auth checks
- **Use RLS when possible** - it's more secure than bypassing with service role
- **Client vs Server clients** - Using the wrong client type can lead to session issues or security vulnerabilities

## Import Reference

```typescript
// For Client Components
import { createClient } from "@/lib/supabase/client";

// For Server Components / API Routes
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
```

## Summary

- **Client Components** → `createClient()` from `lib/supabase/client.ts` (no await)
- **Server Components / API Routes** → `createClient()` from `lib/supabase/server.ts` (with await)
- **Bypass RLS** → `createServiceRoleClient()` from `lib/supabase/server.ts` (server-only, with await)
