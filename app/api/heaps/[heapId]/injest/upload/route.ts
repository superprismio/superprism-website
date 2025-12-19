import {
  ATTACHMENT_MIME_LOOKUP,
  getAttachmentExtension,
  isAttachmentMimeTypeAllowed,
} from "@/lib/attachments";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const formData = await request.formData();

    const fileEntry = formData.get("file");
    // Logging for debugging
    console.log("[upload] FormData keys:", Array.from(formData.keys()));
    console.log("[upload] fileEntry:", fileEntry);

    // Duck-typing check for file shape without 'any'
    function isFileLike(val: unknown): val is File {
      return (
        typeof val === "object" &&
        val !== null &&
        "name" in val &&
        typeof (val as { name: unknown }).name === "string" &&
        "arrayBuffer" in val &&
        typeof (val as { arrayBuffer: unknown }).arrayBuffer === "function"
      );
    }
    if (!isFileLike(fileEntry)) {
      console.log("[upload] Missing or invalid file payload.");
      return NextResponse.json(
        { error: "Missing or invalid file payload." },
        { status: 400 }
      );
    }
    const file = fileEntry;

    const extension = getAttachmentExtension(file.name);
    if (!extension) {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 }
      );
    }
    if (!isAttachmentMimeTypeAllowed(extension, file.type)) {
      return NextResponse.json(
        { error: "Unsupported MIME type." },
        { status: 400 }
      );
    }

    // const fileOp =
    //   typeof body.file_op === "string" && body.file_op === "update"
    //     ? "update"
    //     : "create";
    // TODO: handle update flow when defined
    const fileOp = "create";

    // Add required fields for the upstream API
    formData.set("file_id", crypto.randomUUID());
    formData.set("file_name", file.name);
    formData.set("heap_id", heapId);
    formData.set("user_id", user.id);
    formData.set("file_ext", extension);
    formData.set("file_mime", ATTACHMENT_MIME_LOOKUP[extension]);
    formData.set("file_mime_type", ATTACHMENT_MIME_LOOKUP[extension]);
    formData.set("file_op", fileOp);

    // Handle optional fields
    const fileTags = formData.get("file_tags");
    if (fileTags && typeof fileTags === "string") {
      // Already a string (JSON), keep as is
      formData.set("file_tags", fileTags);
    } else {
      // Default to empty array if not provided
      formData.set("file_tags", JSON.stringify([]));
    }

    const fileFolders = formData.get("file_folders");
    if (fileFolders && typeof fileFolders === "string") {
      // Already a string (JSON), keep as is
      formData.set("file_folders", fileFolders);
    } else {
      // Default folders
      formData.set("file_folders", JSON.stringify(["documents"]));
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
          : "File upload failed.";

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
    console.error("Failed to proxy attachment upload", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while uploading file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
