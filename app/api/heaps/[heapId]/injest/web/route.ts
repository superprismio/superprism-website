import { NextResponse } from "next/server";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

// Initialize Turndown
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

type Params = { params: Promise<{ heapId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { heapId } = await params;
  const body = await request.json().catch(() => null);

  const url = body?.url;

  console.log("heapId", heapId);

  if (!url) {
    return NextResponse.json(
      { error: "Missing URL parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch the page HTML
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch URL: ${response.status}`);
    const html = await response.text();

    // Parse HTML with JSDOM
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();

    // Convert main content or fallback to full HTML
    const markdown = turndown.turndown(article?.content || html);

    return NextResponse.json({ markdown });
  } catch (err) {
    console.error("Error converting URL to Markdown:", err);
    const message = err instanceof Error ? err.message : "Failed to scrape URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
