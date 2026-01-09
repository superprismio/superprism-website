import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ heapId: string; fileId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { heapId, fileId } = await params;
    const supabase = await createClient();
    const serviceClient = await createServiceRoleClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("user", user);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { folders, visibility, file_name } = body ?? {};

    if (folders !== undefined) {
      if (!Array.isArray(folders) || folders.some((f) => typeof f !== "string")) {
        return NextResponse.json(
          { error: "folders must be an array of strings" },
          { status: 400 }
        );
      }
    }

    if (visibility !== undefined && visibility !== "public" && visibility !== "private") {
      return NextResponse.json(
        { error: "visibility must be 'public' or 'private'" },
        { status: 400 }
      );
    }

    if (file_name !== undefined && typeof file_name !== "string") {
      return NextResponse.json(
        { error: "file_name must be a string" },
        { status: 400 }
      );
    }

    console.log("#1 fileId", fileId);
    console.log("#1 heapId", heapId);

    // Fetch the current file
    const { data: currentFile, error: fetchError } = await serviceClient
      .from("files")
      // .select("meta")
      .select()
      .eq("id", fileId)
      .eq("heap_id", heapId)
      .maybeSingle();

    console.log("currentFile", currentFile);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!currentFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if user is the uploader (required for visibility and file_name changes)
    if (
      (visibility !== undefined || file_name !== undefined) &&
      currentFile.uploader_id !== user.id
    ) {
      return NextResponse.json(
        { error: "Only the file uploader can change visibility or file name" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    // Update folders in meta if provided
    if (folders !== undefined) {
      const currentMeta =
        currentFile.meta &&
        typeof currentFile.meta === "object" &&
        !Array.isArray(currentFile.meta)
          ? (currentFile.meta as Record<string, unknown>)
          : {};

      updateData.meta = {
        ...currentMeta,
        folders: folders.map((f: string) => f.toLowerCase()),
      };
    }

    // Update visibility if provided
    if (visibility !== undefined) {
      updateData.visibility = visibility;
    }

    // Update file_name if provided
    if (file_name !== undefined) {
      updateData.file_name = file_name.trim() || null;
    }

    // Apply update
    const { data: updateResult, error: updateError } = await serviceClient
      .from("files")
      .update(updateData)
      .eq("id", fileId)
      .eq("heap_id", heapId)
      .select()
      .maybeSingle();

    console.log("updateResult", updateResult);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ data: updateResult });
  } catch (error) {
    console.error("Failed to update file folders:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while updating file folders.",
      },
      { status: 500 }
    );
  }
}
