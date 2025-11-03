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
