import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type User = {
  id: string;
  email?: string;
  [key: string]: unknown;
};

type AuthResult =
  | { success: true; user: User; supabase: SupabaseClient }
  | { success: false; response: NextResponse };

/**
 * Verifies that a user is authenticated.
 * Returns the user object if authenticated, or a 401 response if not.
 *
 * @param supabase - The Supabase client instance
 * @returns Either { success: true, user, supabase } or { success: false, response }
 *
 * @example
 * ```typescript
 * const supabase = await createClient();
 * const authResult = await requireAuth(supabase);
 *
 * if (!authResult.success) {
 *   return authResult.response;
 * }
 *
 * const { user } = authResult;
 * // User is authenticated, continue with route logic
 * ```
 */
export async function requireAuth(
  supabase: SupabaseClient
): Promise<AuthResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
    supabase,
  };
}

/**
 * Verifies that a user is authenticated AND is a member of the specified heap.
 * Returns the user object if authorized, or an error response if not.
 *
 * @param supabase - The Supabase client instance
 * @param heapId - The heap ID to check membership for
 * @param errorMessage - Optional custom error message (default: "You must be a member of this heap")
 * @returns Either { success: true, user, supabase } or { success: false, response }
 *
 * @example
 * ```typescript
 * const supabase = await createClient();
 * const { heapId } = await params;
 *
 * const authResult = await requireHeapMember(supabase, heapId);
 *
 * if (!authResult.success) {
 *   return authResult.response;
 * }
 *
 * const { user } = authResult;
 * // User is authenticated and is a heap member, continue with route logic
 * ```
 */
export async function requireHeapMember(
  supabase: SupabaseClient,
  heapId: string,
  errorMessage?: string
): Promise<AuthResult> {
  // First check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult;
  }

  // Then check heap membership
  const { data: isMember, error: memberError } = await supabase.rpc(
    "is_heap_member",
    {
      p_heap_id: heapId,
    }
  );

  if (memberError || !isMember) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error:
            errorMessage ||
            "You must be a member of this heap to perform this action",
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Verifies that a user is authenticated AND is an owner of the specified heap.
 * Returns the user object if authorized, or an error response if not.
 *
 * @param supabase - The Supabase client instance
 * @param heapId - The heap ID to check ownership for
 * @param errorMessage - Optional custom error message (default: "You must be an owner of this heap")
 * @returns Either { success: true, user, supabase } or { success: false, response }
 *
 * @example
 * ```typescript
 * const supabase = await createClient();
 * const { heapId } = await params;
 *
 * const authResult = await requireHeapOwner(supabase, heapId);
 *
 * if (!authResult.success) {
 *   return authResult.response;
 * }
 *
 * const { user } = authResult;
 * // User is authenticated and is a heap owner, continue with route logic
 * ```
 */
export async function requireHeapOwner(
  supabase: SupabaseClient,
  heapId: string,
  errorMessage?: string
): Promise<AuthResult> {
  // First check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult;
  }

  // Then check if user is a heap admin (owner or admin)
  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_heap_admin",
    {
      p_heap_id: heapId,
      p_user_id: authResult.user.id,
    }
  );

  if (adminError || !isAdmin) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error:
            errorMessage ||
            "You must be an owner of this heap to perform this action",
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Verifies that a user is authenticated AND is the creator of the specified file.
 * Returns the user object if authorized, or an error response if not.
 *
 * @param supabase - The Supabase client instance
 * @param heapId - The heap ID the file belongs to
 * @param fileId - The file ID to check ownership for
 * @param errorMessage - Optional custom error message (default: "You must be the file creator")
 * @returns Either { success: true, user, supabase } or { success: false, response }
 *
 * @example
 * ```typescript
 * const supabase = await createClient();
 * const { heapId, fileId } = await params;
 *
 * const authResult = await isFileCreator(supabase, heapId, fileId);
 *
 * if (!authResult.success) {
 *   return authResult.response;
 * }
 *
 * const { user } = authResult;
 * // User is authenticated and is the file creator, continue with route logic
 * ```
 */
export async function isFileCreator(
  supabase: SupabaseClient,
  heapId: string,
  fileId: string,
  errorMessage?: string
): Promise<AuthResult> {
  // First check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult;
  }

  // Fetch the file to check uploader_id
  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("uploader_id")
    .eq("id", fileId)
    .eq("heap_id", heapId)
    .maybeSingle();

  if (fileError || !file) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      ),
    };
  }

  if (file.uploader_id !== authResult.user.id) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error:
            errorMessage || "You must be the file creator to perform this action",
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Verifies that a user is authenticated AND is the creator of the specified project (chat session).
 * Returns the user object if authorized, or an error response if not.
 *
 * @param supabase - The Supabase client instance
 * @param heapId - The heap ID the project belongs to
 * @param sessionId - The chat session ID to check ownership for
 * @param errorMessage - Optional custom error message (default: "You must be the project creator")
 * @returns Either { success: true, user, supabase } or { success: false, response }
 *
 * @example
 * ```typescript
 * const supabase = await createClient();
 * const { heapId, sessionId } = await params;
 *
 * const authResult = await isProjectCreator(supabase, heapId, sessionId);
 *
 * if (!authResult.success) {
 *   return authResult.response;
 * }
 *
 * const { user } = authResult;
 * // User is authenticated and is the project creator, continue with route logic
 * ```
 */
export async function isProjectCreator(
  supabase: SupabaseClient,
  heapId: string,
  sessionId: string,
  errorMessage?: string
): Promise<AuthResult> {
  // First check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult;
  }

  // Fetch the chat session to check created_by
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("created_by")
    .eq("id", sessionId)
    .eq("heap_id", heapId)
    .maybeSingle();

  if (sessionError || !session) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      ),
    };
  }

  if (session.created_by !== authResult.user.id) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error:
            errorMessage ||
            "You must be the project creator to perform this action",
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

// ============================================================================
// Client-side helper functions
// These functions are for use in frontend components and assume IDs are
// already available (no database queries needed).
// ============================================================================

/**
 * List of Superprismio Brothers user UUIDs.
 * These users have special privileges for creating spaces.
 */
export const SUPERPRISMIO_BROTHERS = [
  "55d9b2e3-9bfd-480d-9ecb-c0c82578bd44",
  "0e308bde-378c-43aa-a0ec-25b4e777c971",
  "74f87a05-8d30-44b6-900d-8e31cbb740a4",
] as const;

/**
 * Checks if a user is a Superprismio Brother (client-side).
 * This is a simple ID check against the SUPERPRISMIO_BROTHERS list.
 *
 * @param userId - The current user's ID
 * @returns true if the user is a Superprismio Brother, false otherwise
 *
 * @example
 * ```typescript
 * const { data: { user } } = await supabase.auth.getUser();
 *
 * if (isSuperprismioBrother(user?.id)) {
 *   // Show privileged UI elements
 * }
 * ```
 */
export function isSuperprismioBrother(
  userId: string | null | undefined
): boolean {
  if (!userId) {
    return false;
  }
  return SUPERPRISMIO_BROTHERS.includes(userId as typeof SUPERPRISMIO_BROTHERS[number]);
}

/**
 * Checks if a user is the creator of a file (client-side).
 * This is a simple ID comparison and does not query the database.
 *
 * @param userId - The current user's ID
 * @param fileUploaderId - The uploader_id from the file record
 * @returns true if the user is the file creator, false otherwise
 *
 * @example
 * ```typescript
 * const file = await fetchFile(fileId);
 * const { data: { user } } = await supabase.auth.getUser();
 *
 * if (isFileCreatorClient(user?.id, file.uploader_id)) {
 *   // Show edit/delete buttons
 * }
 * ```
 */
export function isFileCreatorClient(
  userId: string | null | undefined,
  fileUploaderId: string | null | undefined
): boolean {
  if (!userId || !fileUploaderId) {
    return false;
  }
  return userId === fileUploaderId;
}

/**
 * Checks if a user is the creator of a project/chat session (client-side).
 * This is a simple ID comparison and does not query the database.
 *
 * @param userId - The current user's ID
 * @param projectCreatedBy - The created_by from the chat_session record
 * @returns true if the user is the project creator, false otherwise
 *
 * @example
 * ```typescript
 * const project = await fetchProject(projectId);
 * const { data: { user } } = await supabase.auth.getUser();
 *
 * if (isProjectCreatorClient(user?.id, project.created_by)) {
 *   // Show project settings/delete buttons
 * }
 * ```
 */
export function isProjectCreatorClient(
  userId: string | null | undefined,
  projectCreatedBy: string | null | undefined
): boolean {
  if (!userId || !projectCreatedBy) {
    return false;
  }
  return userId === projectCreatedBy;
}

/**
 * Checks if a user is either a heap owner/admin OR the file creator (client-side).
 * This combines heap ownership checks with file creator checks.
 *
 * @param userId - The current user's ID
 * @param fileUploaderId - The uploader_id from the file record
 * @param isHeapOwner - Whether the user is a heap owner or admin (can be determined from membership data)
 * @returns true if the user is a heap owner/admin or the file creator, false otherwise
 *
 * @example
 * ```typescript
 * const { data: members } = useSpaceMembers(heapId);
 * const currentUserMembership = members.find(m => m.user_id === userId);
 * const isHeapOwner = currentUserMembership?.role === "admin" || currentUserMembership?.role === "owner";
 *
 * if (isOwnerOrFileCreator(userId, file.uploader_id, isHeapOwner)) {
 *   // Show edit/delete buttons
 * }
 * ```
 */
export function isOwnerOrFileCreator(
  userId: string | null | undefined,
  fileUploaderId: string | null | undefined,
  isHeapOwner: boolean
): boolean {
  if (isHeapOwner) {
    return true;
  }
  return isFileCreatorClient(userId, fileUploaderId);
}

/**
 * Checks if a user is either a heap owner/admin OR the project creator (client-side).
 * This combines heap ownership checks with project creator checks.
 *
 * @param userId - The current user's ID
 * @param projectCreatedBy - The created_by from the chat_session record
 * @param isHeapOwner - Whether the user is a heap owner or admin (can be determined from membership data)
 * @returns true if the user is a heap owner/admin or the project creator, false otherwise
 *
 * @example
 * ```typescript
 * const { data: members } = useSpaceMembers(heapId);
 * const currentUserMembership = members.find(m => m.user_id === userId);
 * const isHeapOwner = currentUserMembership?.role === "admin" || currentUserMembership?.role === "owner";
 *
 * if (isOwnerOrProjectCreator(userId, project.created_by, isHeapOwner)) {
 *   // Show project settings/delete buttons
 * }
 * ```
 */
export function isOwnerOrProjectCreator(
  userId: string | null | undefined,
  projectCreatedBy: string | null | undefined,
  isHeapOwner: boolean
): boolean {
  if (isHeapOwner) {
    return true;
  }
  return isProjectCreatorClient(userId, projectCreatedBy);
}
