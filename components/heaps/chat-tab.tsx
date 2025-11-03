"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ChatTab({
  heapId,
  attachedFileIds = [],
  onExportToEditor,
}: {
  heapId: string;
  attachedFileIds?: string[];
  onAttachedFileIdsChange?: (ids: string[]) => void;
  onExportToEditor?: (content: string) => void;
}) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);

  async function handleSendChat() {
    if (!heapId || !chatInput.trim()) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((m) => [...m, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`/api/heaps/${heapId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg.content,
          file_ids: attachedFileIds,
        }),
      });
      const json = await res.json();
      const assistantText = json?.message || "";
      setChatMessages((m) => [
        ...m,
        { role: "assistant", content: assistantText },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function exportLastAssistantToEditor() {
    const last = [...chatMessages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (last) onExportToEditor?.(last.content);
  }

  return (
    <Card className="min-h-[400px]">
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="text-sm text-muted-foreground">Attached files:</div>
          {attachedFileIds.length === 0 && (
            <div className="text-xs text-muted-foreground">None</div>
          )}
          {attachedFileIds.map((id) => (
            <Badge key={id} variant="secondary">
              {id}
            </Badge>
          ))}
        </div>
        <div className="flex-1 border rounded p-3 space-y-2 overflow-auto max-h-[300px]">
          <div className="text-sm text-muted-foreground text-center py-8">
            Coming soon...
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your question"
            disabled
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendChat();
              }
            }}
          />
          <Button
            onClick={handleSendChat}
            disabled
          >
            Send
          </Button>
          <Button variant="secondary" onClick={exportLastAssistantToEditor} disabled>
            Export to editor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
