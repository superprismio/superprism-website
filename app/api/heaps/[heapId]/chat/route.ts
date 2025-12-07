import { NextResponse } from "next/server";

// Placeholder: will wrap an n8n webhook for chat/LLM interactions
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  
  // Mock responses for demo
  const query = body?.query || "";
  const isSummarize = body?.summarize === true;
  
  if (isSummarize) {
    // Mock markdown summary response
    return NextResponse.json({
      message: `# Conversation Summary\n\n## Overview\n\nThis conversation covered various topics related to the space.\n\n## Key Points\n\n- Discussion about space features\n- Questions about functionality\n- General inquiries\n\n## Notes\n\nThis is a mock summary response for demonstration purposes.`,
    });
  }
  
  // Mock chat responses based on query
  let mockResponse = "This is a mock response from the LLM.";
  
  if (query.toLowerCase().includes("what's new") || query.toLowerCase().includes("whats new")) {
    mockResponse = "Here are the latest updates in this space:\n\n- New features have been added\n- Recent improvements to the knowledge base\n- Enhanced collaboration tools\n\nThis is a mock response for demonstration.";
  } else if (query.toLowerCase().includes("what's this space about") || query.toLowerCase().includes("whats this space about") || query.toLowerCase().includes("about")) {
    mockResponse = "This space is designed to help you organize and interact with your knowledge base. You can explore files, chat with the LLM about your content, and collaborate with team members.\n\nThis is a mock response for demonstration.";
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    message: mockResponse,
  });
}


