import {
  ATTACHMENT_MIME_LOOKUP,
  getAttachmentExtension,
  isAttachmentMimeTypeAllowed,
  MAX_FILE_SIZE,
} from "@/lib/attachments";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { N8N_ENDPOINTS } from "@/lib/constants";

const UPLOAD_ENDPOINT = N8N_ENDPOINTS.ingest;

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ heapId: string }> };

type BatchUploadResult = {
  fileName: string;
  success: boolean;
  error?: string;
};

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

async function uploadSingleFile(
  file: File,
  heapId: string,
  userId: string
): Promise<BatchUploadResult> {
  const extension = getAttachmentExtension(file.name);
  if (!extension) {
    return {
      fileName: file.name,
      success: false,
      error: "Unsupported file type.",
    };
  }

  if (!isAttachmentMimeTypeAllowed(extension, file.type)) {
    return {
      fileName: file.name,
      success: false,
      error: "Unsupported MIME type.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      fileName: file.name,
      success: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  const formData = new FormData();
  formData.set("file", file);

  const fileOp = "create";

  // Add required fields for the upstream API
  formData.set("file_id", crypto.randomUUID());
  formData.set("file_name", file.name);
  formData.set("heap_id", heapId);
  formData.set("user_id", userId);
  formData.set("file_ext", extension);
  formData.set("file_mime", ATTACHMENT_MIME_LOOKUP[extension]);
  formData.set("file_mime_type", ATTACHMENT_MIME_LOOKUP[extension]);
  formData.set("file_op", fileOp);

  // Handle optional fields
  const fileTags = formData.get("file_tags");
  if (fileTags && typeof fileTags === "string") {
    formData.set("file_tags", fileTags);
  } else {
    formData.set("file_tags", JSON.stringify([]));
  }

  const fileFolders = formData.get("file_folders");
  if (fileFolders && typeof fileFolders === "string") {
    formData.set("file_folders", fileFolders);
  } else {
    formData.set("file_folders", JSON.stringify(["documents"]));
  }

  try {
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

      return {
        fileName: file.name,
        success: false,
        error: message,
      };
    }

    return {
      fileName: file.name,
      success: true,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while uploading file.";
    return {
      fileName: file.name,
      success: false,
      error: message,
    };
  }
}

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

    // Get all files from FormData
    const files: File[] = [];
    const fileEntries = formData.getAll("files");

    for (const entry of fileEntries) {
      if (isFileLike(entry)) {
        files.push(entry);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No valid files provided." },
        { status: 400 }
      );
    }

    // Upload all files in parallel
    const uploadPromises = files.map((file) =>
      uploadSingleFile(file, heapId, user.id)
    );

    const results = await Promise.all(uploadPromises);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        ok: true,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failureCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to process batch upload", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while processing batch upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

