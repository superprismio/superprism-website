"use client";

import { useState } from "react";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { TextEditor } from "./text-editor";
import { FileDown } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function SpaceChat({ heapId }: WorkspacePaneComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [fileIds] = useState<string[]>([]); // For future project chat support

  const sendMessage = async (messageText: string, summarize = false) => {
    if (!messageText.trim() && !summarize) return;

    if (summarize) {
      setLoading(true);
      try {
        const response = await fetch(`/api/heaps/${heapId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summarize: true,
            file_ids: fileIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to summarize conversation");
        }

        const data = await response.json();
        setEditorContent(data.message || "");
        setShowEditor(true);
      } catch (error) {
        console.error("Error summarizing:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`/api/heaps/${heapId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: messageText,
          file_ids: fileIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || "",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreFilledPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSummarize = () => {
    sendMessage("", true);
  };

  const hasAssistantResponse = messages.some((m) => m.role === "assistant");

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Chat with Space</h3>
      </header>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col px-3 py-4 space-y-4 min-h-0 overflow-hidden">
          {/* Pre-filled prompt buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10"
              onClick={() => handlePreFilledPrompt("What's New?")}
              disabled={loading}
            >
              What's New?
            </Button>
            <Button
              variant="outline"
              className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10"
              onClick={() => handlePreFilledPrompt("What's this space about?")}
              disabled={loading}
            >
              What's this space about?
            </Button>
          </div>

          {/* Chat window */}
          <div className="flex-1 border rounded-lg p-4 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  <div className="mb-2">&gt;_</div>
                  <p className="text-xs">Start a conversation by typing a message or using one of the prompts above.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) {
                      sendMessage(input);
                    }
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                rows={2}
                className="resize-none"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
              >
                Send
              </Button>
            </div>
          </div>

          {/* Summarize button */}
          {hasAssistantResponse && (
            <Button
              variant="outline"
              className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 w-full"
              onClick={handleSummarize}
              disabled={loading}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Summarize this conversation as a markdown file for export
            </Button>
          )}
        </div>

        {/* Text Editor (shown when summarize is clicked) */}
        {showEditor && (
          <div className="border-t flex-shrink-0" style={{ height: "400px" }}>
            <TextEditor heapId={heapId} initialMarkdown={editorContent} />
          </div>
        )}
      </div>
    </>
  );
}
