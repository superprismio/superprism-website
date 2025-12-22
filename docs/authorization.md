# Authorization Guide

This document outlines the authorization system in this application, including how to check user permissions for heaps, files, and projects.

## Overview

The authorization system provides helper functions to check user permissions at different levels:

1. **Heap-level permissions** - Owner, Admin, and Member roles
2. **Resource-level permissions** - File creator and Project creator checks
3. **Server-side helpers** - For API routes (with database queries)
4. **Client-side helpers** - For frontend components (simple ID comparisons)

## Permission Hierarchy

### Heap Roles

- **Owner** - Full control over the heap, including member management and settings
- **Admin** - Can manage members and most heap settings (includes owners)
- **Member** - Basic access to heap resources

### Resource Ownership

- **File Creator** - User who uploaded the file (`files.uploader_id`)
- **Project Creator** - User who created the project/chat session (`chat_sessions.created_by`)

## Server-Side Helpers

These functions are used in API routes and perform database queries to verify permissions. They return an `AuthResult` type that can be used to handle authorization failures.

### `requireAuth`

Verifies that a user is authenticated. This is the base check used by all other authorization functions.

**Location:** `lib/auth-helpers.ts`

**Usage:**
```typescript
import { requireAuth } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const authResult = await requireAuth(supabase);

  if (!authResult.success) {
    return authResult.response; // Returns 401 Unauthorized
  }

  const { user } = authResult;
  // User is authenticated, continue with route logic
}
```

### `requireHeapMember`

Verifies that a user is authenticated AND is a member of the specified heap.

**Location:** `lib/auth-helpers.ts`

**Parameters:**
- `supabase` - The Supabase client instance
- `heapId` - The heap ID to check membership for
- `errorMessage` - Optional custom error message

**Usage:**
```typescript
import { requireHeapMember } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ heapId: string }> }
) {
  const { heapId } = await params;
  const supabase = await createClient();

  const authResult = await requireHeapMember(supabase, heapId);

  if (!authResult.success) {
    return authResult.response; // Returns 403 Forbidden
  }

  const { user } = authResult;
  // User is authenticated and is a heap member
}
```

### `requireHeapOwner`

Verifies that a user is authenticated AND has the "owner" role in the specified heap.

**Location:** `lib/auth-helpers.ts`

**Parameters:**
- `supabase` - The Supabase client instance
- `heapId` - The heap ID to check ownership for
- `errorMessage` - Optional custom error message (default: "You must be an owner of this heap")

**Usage:**
```typescript
import { requireHeapOwner } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ heapId: string }> }
) {
  const { heapId } = await params;
  const supabase = await createClient();

  const authResult = await requireHeapOwner(
    supabase,
    heapId,
    "Only heap owners can delete heaps"
  );

  if (!authResult.success) {
    return authResult.response; // Returns 403 Forbidden
  }

  const { user } = authResult;
  // User is authenticated and is a heap owner
}
```

### `requireHeapAdmin`

Verifies that a user is authenticated AND has the "admin" or "owner" role in the specified heap.

**Location:** `lib/auth-helpers.ts`

**Parameters:**
- `supabase` - The Supabase client instance
- `heapId` - The heap ID to check admin status for
- `errorMessage` - Optional custom error message (default: "You must be an admin of this heap")

**Usage:**
```typescript
import { requireHeapAdmin } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ heapId: string; membershipId: string }> }
) {
  const { heapId } = await params;
  const supabase = await createClient();

  const authResult = await requireHeapAdmin(supabase, heapId);

  if (!authResult.success) {
    return authResult.response; // Returns 403 Forbidden
  }

  const { user } = authResult;
  // User is authenticated and is a heap admin or owner
}
```

### `isFileCreator`

Verifies that a user is authenticated AND is the creator of the specified file (checks `files.uploader_id`).

**Location:** `lib/auth-helpers.ts`

**Parameters:**
- `supabase` - The Supabase client instance
- `heapId` - The heap ID the file belongs to
- `fileId` - The file ID to check ownership for
- `errorMessage` - Optional custom error message (default: "You must be the file creator")

**Usage:**
```typescript
import { isFileCreator } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ heapId: string; fileId: string }> }
) {
  const { heapId, fileId } = await params;
  const supabase = await createClient();

  const authResult = await isFileCreator(supabase, heapId, fileId);

  if (!authResult.success) {
    return authResult.response; // Returns 403 Forbidden or 404 Not Found
  }

  const { user } = authResult;
  // User is authenticated and is the file creator
}
```

### `isProjectCreator`

Verifies that a user is authenticated AND is the creator of the specified project/chat session (checks `chat_sessions.created_by`).

**Location:** `lib/auth-helpers.ts`

**Parameters:**
- `supabase` - The Supabase client instance
- `heapId` - The heap ID the project belongs to
- `sessionId` - The chat session ID to check ownership for
- `errorMessage` - Optional custom error message (default: "You must be the project creator")

**Usage:**
```typescript
import { isProjectCreator } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ heapId: string; sessionId: string }> }
) {
  const { heapId, sessionId } = await params;
  const supabase = await createClient();

  const authResult = await isProjectCreator(supabase, heapId, sessionId);

  if (!authResult.success) {
    return authResult.response; // Returns 403 Forbidden or 404 Not Found
  }

  const { user } = authResult;
  // User is authenticated and is the project creator
}
```

## Client-Side Helpers

These functions are used in frontend components and perform simple ID comparisons. They assume the necessary IDs are already available from the data you're working with (no database queries).

### `isFileCreatorClient`

Checks if a user is the creator of a file by comparing user ID with file uploader ID.

**Location:** `lib/auth-helpers.ts`

**Parameters:**
- `userId` - The current user's ID (from `supabase.auth.getUser()`)
- `fileUploaderId` - The `uploader_id` from the file record

**Returns:** `boolean`

**Usage:**
```typescript
"use client";

import { isFileCreatorClient } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function FileActions({ file }: { file: FileRow }) {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, [supabase]);

  const canEdit = isFileCreatorClient(userId, file.uploader_id);

  return (
    <div>
      {canEdit && (
        <button onClick={handleEdit}>Edit File</button>
      )}
      {canEdit && (
        <button onClick={handleDelete}>Delete File</button>
      )}
    </div>
  );
}
```

### `isProjectCreatorClient`

Checks if a user is the creator of a project by comparing user ID with project creator ID.

**Location:** `lib/auth-helpers.ts`

**Parameters:**
- `userId` - The current user's ID (from `supabase.auth.getUser()`)
- `projectCreatedBy` - The `created_by` from the chat_session record

**Returns:** `boolean`

**Usage:**
```typescript
"use client";

import { isProjectCreatorClient } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type ChatSession = {
  id: string;
  created_by: string | null;
  title: string | null;
  // ... other fields
};

export function ProjectActions({ project }: { project: ChatSession }) {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, [supabase]);

  const canManage = isProjectCreatorClient(userId, project.created_by);

  return (
    <div>
      {canManage && (
        <button onClick={handleSettings}>Project Settings</button>
      )}
      {canManage && (
        <button onClick={handleDelete}>Delete Project</button>
      )}
    </div>
  );
}
```

## Common Patterns

### Combining Permissions

You can combine multiple permission checks in API routes:

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ heapId: string; fileId: string }> }
) {
  const { heapId, fileId } = await params;
  const supabase = await createClient();

  // First check if user is a heap member
  const memberResult = await requireHeapMember(supabase, heapId);
  if (!memberResult.success) {
    return memberResult.response;
  }

  // Then check if user is the file creator OR a heap admin
  const fileResult = await isFileCreator(supabase, heapId, fileId);
  if (!fileResult.success) {
    // If not file creator, check if admin
    const adminResult = await requireHeapAdmin(supabase, heapId);
    if (!adminResult.success) {
      return adminResult.response;
    }
  }

  // User is either the file creator or a heap admin
  const { user } = memberResult;
  // Continue with update logic
}
```

### Error Handling

All server-side helpers return an `AuthResult` type:

```typescript
type AuthResult =
  | { success: true; user: User; supabase: SupabaseClient }
  | { success: false; response: NextResponse };
```

Always check `authResult.success` before accessing the `user` property:

```typescript
const authResult = await requireHeapMember(supabase, heapId);

if (!authResult.success) {
  // Returns a NextResponse with appropriate status code
  // 401 for authentication failures
  // 403 for authorization failures
  // 404 for resource not found
  return authResult.response;
}

// TypeScript knows authResult.success is true here
const { user, supabase } = authResult;
```

## Best Practices

1. **Always check authentication first** - Use `requireAuth` or let other helpers handle it
2. **Use appropriate permission levels** - Don't require owner/admin when member access is sufficient
3. **Provide clear error messages** - Use the optional `errorMessage` parameter for context-specific errors
4. **Client-side checks are for UI only** - Always verify permissions server-side in API routes
5. **Combine checks when needed** - Some actions may require multiple permission checks

## Related Documentation

- [Authentication Guide](./authentication.md) - How authentication works in the app
- [Supabase Clients](./supabase-clients.md) - How to create Supabase client instances

