import { NextResponse } from "next/server";

// Placeholder: will wrap an n8n webhook for chat/LLM interactions
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  return NextResponse.json(
    {
      message: "Chat endpoint not yet implemented",
      received: body ?? null,
    },
    { status: 501 },
  );
}


