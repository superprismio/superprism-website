import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { N8N_ENDPOINTS } from "@/lib/constants";

const webhookUrl = N8N_ENDPOINTS.ingest;

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ heapId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { heapId } = await params;
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.file_id !== "string" || !body.file_id.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid file_id." },
        { status: 400 }
      );
    }

    const fileId = body.file_id.trim();

    // Verify the user is the uploader
    const serviceClient = await createServiceRoleClient();
    const { data: currentFile, error: fetchError } = await serviceClient
      .from("files")
      .select("uploader_id")
      .eq("id", fileId)
      .eq("heap_id", heapId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to verify file ownership" },
        { status: 400 }
      );
    }

    if (!currentFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (currentFile.uploader_id !== user.id) {
      return NextResponse.json(
        { error: "Only the file uploader can delete this file" },
        { status: 403 }
      );
    }

    // Create FormData for the upstream API
    const formData = new FormData();
    formData.set("file_id", fileId);
    formData.set("heap_id", heapId);
    formData.set("user_id", user.id);
    formData.set("file_op", "delete");
    formData.set("file_tags", JSON.stringify([]));

    const upstreamResponse = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });

    const rawBody = await upstreamResponse.text();
    let parsedBody: unknown = null;

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }
    }

    if (!upstreamResponse.ok) {
      const message =
        typeof parsedBody === "string"
          ? parsedBody
          : typeof parsedBody === "object" &&
            parsedBody &&
            "error" in parsedBody
          ? String((parsedBody as Record<string, unknown>).error)
          : "File deletion failed.";

      return NextResponse.json(
        { error: message, details: parsedBody },
        { status: upstreamResponse.status }
      );
    }

    return NextResponse.json(
      { ok: true, data: parsedBody ?? null },
      { status: upstreamResponse.status }
    );
  } catch (error) {
    console.error("Failed to delete file", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while deleting file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
