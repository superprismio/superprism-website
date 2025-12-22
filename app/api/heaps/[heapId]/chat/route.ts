import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireHeapMember } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string }> };

const webhookUrl = "https://n8n-workflows-production-d083.up.railway.app/webhook/chat";

export async function POST(request: Request, { params }: Params) {
  const { heapId } = await params;
  const body = await request.json().catch(() => ({}));
  const { chatInput, sessionId, isProject } = body ?? {};

  if (!chatInput || typeof chatInput !== "string") {
    return NextResponse.json({ error: "chatInput is required" }, { status: 400 });
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
        meta: { isProject: false, fileIds: [] },
      })
      .select("*")
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
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

  // Store user message
  const userMessageId = crypto.randomUUID();
  const { error: userMessageError } = await serviceClient
    .from("chat_messages")
    .insert({
      id: userMessageId,
      heap_id: heapId,
      session_id: finalSessionId,
      role: "user",
      content: chatInput,
    });

  if (userMessageError) {
    return NextResponse.json({ error: userMessageError.message }, { status: 400 });
  }

  // Call n8n webhook
  const payload = {
    chatInput: chatInput,
    sessionId: finalSessionId,
    heapId: heapId,
  };

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

    // Store assistant response
    const assistantMessageId = crypto.randomUUID();
    const { error: assistantMessageError } = await serviceClient
      .from("chat_messages")
      .insert({
        id: assistantMessageId,
        heap_id: heapId,
        session_id: finalSessionId,
        role: "assistant",
        content: assistantMessage,
      });

    if (assistantMessageError) {
      // Log error but still return the response
      console.error("Error storing assistant message:", assistantMessageError);
    }

    return NextResponse.json({
      data: {
        ...webhookData,
        message: assistantMessage,
        sessionId: finalSessionId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to call webhook" },
      { status: 500 }
    );
  }
}


