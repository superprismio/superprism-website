import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireHeapMember } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string }> };

const webhookUrl =
  "https://n8n-workflows-production-d083.up.railway.app/webhook/chat";

export async function POST(request: Request, { params }: Params) {
  const { heapId } = await params;
  const body = await request.json().catch(() => ({}));
  const { chatInput, sessionId, isProject, meta, filter } = body ?? {};

  if (!chatInput || typeof chatInput !== "string") {
    return NextResponse.json(
      { error: "chatInput is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Verify user is authenticated and is a heap member
  const authResult = await requireHeapMember(
    supabase,
    heapId,
    "You must be a member of this heap to chat"
  );
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;
  const serviceClient = await createServiceRoleClient();

  let finalSessionId = sessionId || undefined;

  // For space chat (not a project), create a session on first message if no sessionId provided
  if (!finalSessionId && !isProject) {
    const { data: newSession, error: sessionError } = await serviceClient
      .from("chat_sessions")
      .insert({
        id: crypto.randomUUID(),
        heap_id: heapId,
        title: "Space Chat",
        created_by: user.id,
        meta: { isProject: false, file_id: [] },
      })
      .select("*")
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 400 }
      );
    }

    finalSessionId = newSession.id;
  }

  // If still no sessionId, it's an error (project chats require an existing session)
  if (!finalSessionId) {
    return NextResponse.json(
      { error: "sessionId is required for project chats" },
      { status: 400 }
    );
  }

  console.log("meta", meta);
  console.log("filter", filter);

  // Call n8n webhook
  const payload: Record<string, unknown> = {
    chatInput: chatInput,
    sessionId: finalSessionId,
    heapId: heapId,
  };

  // TODO: can activate this if/when we allow the user to toggle
  // filter filed limits rag to selected files
  // meta field loads the file content into context
  // if (meta !== undefined) {
  //   payload.meta = meta;
  // }

  if (filter !== undefined) {
    payload.filter = filter;
  }

  console.log("chat payload", payload);

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      return NextResponse.json(
        { error: `Webhook error: ${errorText}` },
        { status: webhookResponse.status }
      );
    }

    const webhookData = await webhookResponse.json();
    const assistantMessage = webhookData.output || "";

    return NextResponse.json({
      data: {
        ...webhookData,
        message: assistantMessage,
        sessionId: finalSessionId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to call webhook",
      },
      { status: 500 }
    );
  }
}
