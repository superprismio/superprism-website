import { ATTACHMENT_MIME_LOOKUP } from "@/lib/attachments";
import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const UPLOAD_ENDPOINT =
  "https://n8n-workflows-production-d083.up.railway.app/webhook/ingest-pipeline";

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
    if (!body || typeof body.markdown !== "string" || !body.markdown.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid markdown payload." },
        { status: 400 }
      );
    }

    // Determine if this is an update or create operation
    const fileOp =
      typeof body.file_op === "string" && body.file_op === "update"
        ? "update"
        : "create";
    const isUpdate = fileOp === "update";

    console.log("fileOp", fileOp);

    // Get file_id for updates, or generate new one for creates
    const fileId =
      isUpdate && typeof body.file_id === "string" && body.file_id.trim()
        ? body.file_id.trim()
        : crypto.randomUUID();

    // For updates, verify the user is the uploader
    if (isUpdate) {
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
          { error: "Only the file uploader can edit this file" },
          { status: 403 }
        );
      }
    }

    // Get filename from request or use default
    const requestedFileName =
      typeof body.file_name === "string" && body.file_name.trim()
        ? body.file_name.trim()
        : `markdown-${Date.now()}.md`;
    // Ensure filename ends with .md
    const fileName = requestedFileName.endsWith(".md")
      ? requestedFileName
      : `${requestedFileName}.md`;

    // Convert markdown text to a File object
    const markdownBlob = new Blob([body.markdown], {
      type: ATTACHMENT_MIME_LOOKUP.md,
    });
    const file = new File([markdownBlob], fileName, {
      type: ATTACHMENT_MIME_LOOKUP.md,
    });

    // Create FormData similar to the upload route
    const formData = new FormData();
    formData.set("file", file);
    formData.set("file_id", fileId);
    formData.set("file_name", fileName);
    formData.set("heap_id", heapId);
    formData.set("user_id", user.id);
    formData.set("file_ext", "md");
    formData.set("file_mime", ATTACHMENT_MIME_LOOKUP.md);
    formData.set("file_mime_type", ATTACHMENT_MIME_LOOKUP.md);
    formData.set("file_op", fileOp);

    // Handle optional fields (can be extended later if needed)
    const fileTags = body.file_tags;
    if (fileTags && Array.isArray(fileTags)) {
      formData.set("file_tags", JSON.stringify(fileTags));
    } else {
      formData.set("file_tags", JSON.stringify([]));
    }

    const fileFolders = body.file_folders;
    if (fileFolders && Array.isArray(fileFolders)) {
      formData.set("file_folders", JSON.stringify(fileFolders));
    } else {
      // Default folders for markdown notes
      formData.set("file_folders", JSON.stringify(["notes"]));
    }

    const upstreamResponse = await fetch(UPLOAD_ENDPOINT, {
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
          : "Markdown ingestion failed.";

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
    console.error("Failed to ingest markdown", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while ingesting markdown.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
