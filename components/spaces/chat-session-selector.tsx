"use client";

import { useChat, useSpaceChatSessions } from "@/hooks/useChat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ChatSessionSelectorProps = {
  heapId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChatSessionSelector({
  heapId,
  open,
  onOpenChange,
}: ChatSessionSelectorProps) {
  const { data: sessions, isLoading } = useSpaceChatSessions(heapId);
  const { setActiveChatSession, activeChatSession } = useChat();

  const handleSelectSession = (session: NonNullable<typeof sessions>[0]) => {
    setActiveChatSession(session);
    onOpenChange(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Previous Chat Sessions</DialogTitle>
          <DialogDescription>
            Select a previous chat session to continue the conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Loading sessions...
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No previous chat sessions found.
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const isActive =
                  activeChatSession?.id === session.id &&
                  activeChatSession?.id !== null;
                return (
                  <Button
                    key={session.id}
                    variant={isActive ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleSelectSession(session)}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="font-medium text-sm">
                        {session.title || "Untitled Chat"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(session.created_at)}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
