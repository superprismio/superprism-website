import { NextResponse } from "next/server";

type Params = { params: { heapId: string } };

// Placeholder: will wrap an n8n webhook to ingest files/content into a heap
export async function POST(request: Request, { params }: Params) {
  // Intentionally minimal; we'll wire to n8n later.
  // Keep request body readable for future forwarding.
  const body = await request.json().catch(() => null);
  return NextResponse.json(
    {
      message: "Ingest endpoint not yet implemented",
      heapId: params.heapId,
      received: body ?? null,
    },
    { status: 501 },
  );
}


