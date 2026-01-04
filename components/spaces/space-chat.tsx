"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import { useChat, useChatMessages, useSendChatMessage } from "@/hooks/useChat";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { TextEditor } from "./text-editor";
import { Dialog, DialogContent } from "../ui/dialog";
import { History, X, Copy, Check, FileEdit } from "lucide-react";
import { ChatSessionSelector } from "./chat-session-selector";
import { isOwnerOrProjectCreator } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/client";
import { useSpaceMembers } from "@/hooks/useMembers";
import { PrismLoader } from "../shared/prism-loader";

// type Message = {
//   role: "user" | "assistant";
//   content: string;
// };

export function SpaceChat({ heapId }: WorkspacePaneComponentProps) {
  const { activeChatSession, isProject, isPresaved, setActiveChatSession } =
    useChat();
  const { data: fetchedMessages, isLoading: isLoadingMessages } =
    useChatMessages(heapId);
  const sendMessageMutation = useSendChatMessage(heapId);
  const { data: members = [] } = useSpaceMembers(heapId);
  const [input, setInput] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isSessionSelectorOpen, setIsSessionSelectorOpen] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(
    null
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    void getCurrentUser();
  }, []);

  // Check if current user is heap owner/admin
  const isHeapOwner = useMemo(() => {
    if (!currentUserId) return false;
    const currentUserMembership = members.find(
      (m) => m.user_id === currentUserId
    );
    return (
      currentUserMembership?.role === "admin" ||
      currentUserMembership?.role === "owner"
    );
  }, [members, currentUserId]);

  // Convert fetched messages to display format
  const messages = useMemo(() => {
    return (fetchedMessages || []).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
  }, [fetchedMessages]);

  const loading = sendMessageMutation.isPending;

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingMessages, loading]);

  const sendMessage = async (messageText: string, summarize = false) => {
    if (!messageText.trim() && !summarize) return;

    if (summarize) {
      // TODO: Handle summarize separately if needed
      // For now, we'll skip summarize functionality
      return;
    }

    setInput("");
    sendMessageMutation.mutate(
      { chatInput: messageText },
      {
        onError: (error) => {
          console.error("Error sending message:", error);
        },
      }
    );
  };

  const handlePreFilledPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  // const handleSummarize = () => {
  //   // TODO: Implement summarize functionality
  //   sendMessage("", true);
  // };

  // Check if user is the project owner or heap owner (only for saved projects)
  const isProjectOwner = useMemo(() => {
    if (!isProject || !activeChatSession || activeChatSession.id === null) {
      return true; // Allow chat for non-projects or pending projects
    }
    const projectCreatedBy = (
      activeChatSession as { created_by?: string | null }
    ).created_by;
    return isOwnerOrProjectCreator(
      currentUserId,
      projectCreatedBy,
      isHeapOwner
    );
  }, [isProject, activeChatSession, currentUserId, isHeapOwner]);

  const chatDisabled = isPresaved || (isProject && !isProjectOwner);
  const chatTitle = isProject ? "Chat with Project" : "Chat with Space";

  const hasActiveSession =
    activeChatSession !== null && activeChatSession.id !== null;

  const handleClearChat = () => {
    setActiveChatSession(null);
  };

  const handleCopyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleAddToEditor = (content: string) => {
    setEditorContent(content);
    setShowEditor(true);
  };

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">{chatTitle}</h3>
      </header>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col px-3 py-4 space-y-4 min-h-0 overflow-hidden">
          {/* Pre-filled prompt buttons - only show in space mode */}
          {!isProject && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10"
                onClick={() => handlePreFilledPrompt("What's New?")}
                disabled={loading || chatDisabled}
              >
                What&apos;s New?
              </Button>
              <Button
                variant="outline"
                className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10"
                onClick={() =>
                  handlePreFilledPrompt("What's this space about?")
                }
                disabled={loading || chatDisabled}
              >
                What&apos;s this space about?
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 flex-1"
                  onClick={() => setIsSessionSelectorOpen(true)}
                  disabled={loading || chatDisabled}
                >
                  <History className="mr-2 h-4 w-4" />
                  Previous Chats
                </Button>
                {hasActiveSession && (
                  <Button
                    variant="outline"
                    className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10"
                    onClick={handleClearChat}
                    disabled={loading || chatDisabled}
                    title="Clear active chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Chat window */}
          <div className="flex-1 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 mb-4 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="space-y-3 pr-4">
                  {chatDisabled ? (
                    <div className="text-sm text-muted-foreground">
                      <div className="mb-2">&gt;_</div>
                      <p className="text-xs">
                        {isPresaved
                          ? "Please save the project before starting a conversation."
                          : isProject && !isProjectOwner
                          ? "You can only chat with projects you created. Clone this project to create your own version and chat with it."
                          : "Chat is disabled."}
                      </p>
                    </div>
                  ) : isLoadingMessages ? (
                    <div className="text-sm text-muted-foreground">
                      <div className="mb-2">&gt;_</div>
                      <p className="text-xs">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      <div className="mb-2">&gt;_</div>
                      <p className="text-xs">
                        {isProject
                          ? "Start a conversation about this project."
                          : "Start a conversation by typing a message or using one of the prompts above."}
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 text-sm relative group ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground pb-8"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute bottom-1 right-8 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  handleAddToEditor(message.content)
                                }
                                title="Add to text editor"
                              >
                                <FileEdit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  handleCopyMessage(message.content, index)
                                }
                                title="Copy message"
                              >
                                {copiedMessageIndex === index ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </>
                          )}
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                        <PrismLoader size={24} className="text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Chat input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !chatDisabled) {
                      sendMessage(input);
                    }
                  }
                }}
                placeholder={
                  chatDisabled
                    ? "Save the project to enable chat..."
                    : "Type your message..."
                }
                disabled={loading || chatDisabled}
                rows={2}
                className="resize-none"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim() || chatDisabled}
              >
                Send
              </Button>
            </div>
          </div>

          {/* Summarize button */}
          {/* {hasAssistantResponse && !chatDisabled && (
            <Button
              variant="outline"
              className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 w-full"
              onClick={handleSummarize}
              disabled={loading}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Summarize this conversation as a markdown file for export
            </Button>
          )} */}
        </div>
      </div>
      {!isProject && (
        <ChatSessionSelector
          heapId={heapId}
          open={isSessionSelectorOpen}
          onOpenChange={setIsSessionSelectorOpen}
        />
      )}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <TextEditor
            heapId={heapId}
            initialMarkdown={editorContent}
            sessionId={
              activeChatSession && activeChatSession.id !== null
                ? activeChatSession.id
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
