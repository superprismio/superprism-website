import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ heapId: string; fileId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { heapId, fileId } = await params;
    const supabase = await createClient();
    const serviceClient = await createServiceRoleClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the file to get storage path
    const { data: file, error: fetchError } = await serviceClient
      .from("files")
      .select()
      .eq("id", fileId)
      .eq("heap_id", heapId)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get the extracted_storage_path from meta
    const meta =
      file.meta &&
      typeof file.meta === "object" &&
      !Array.isArray(file.meta)
        ? (file.meta as Record<string, unknown>)
        : {};

    const extractedStoragePath = meta.extracted_storage_path;

    if (!extractedStoragePath || typeof extractedStoragePath !== "string") {
      return NextResponse.json(
        { error: "File storage path not found" },
        { status: 404 }
      );
    }

    // Create signed URL for file download
    const { data: signedUrlData, error: signedUrlError } =
      await serviceClient.storage
        .from("kb-files")
        .createSignedUrl(extractedStoragePath, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError);
      return NextResponse.json(
        { error: signedUrlError.message },
        { status: 500 }
      );
    }

    if (!signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate signed URL" },
        { status: 500 }
      );
    }

    // Fetch the file content
    const response = await fetch(signedUrlData.signedUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file content" },
        { status: 500 }
      );
    }

    const content = await response.text();

    return NextResponse.json({ data: { content } });
  } catch (error) {
    console.error("Failed to fetch raw file:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while fetching raw file.",
      },
      { status: 500 }
    );
  }
}
