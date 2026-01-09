"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/types/supabase";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"] & {
  filters?: Record<string, unknown>;
};

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; file_id: string[] };
  created_at: null;
  filter?: Record<string, unknown>;
};

type ActiveChatSession = ChatSession | PendingProject | null;

type ChatContextType = {
  activeChatSession: ActiveChatSession;
  setActiveChatSession: (session: ActiveChatSession) => void;
  isProject: boolean;
  isPresaved: boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChatSession, setActiveChatSession] =
    useState<ActiveChatSession>(null);

  const isProject = (() => {
    if (activeChatSession === null) return false;
    // Pending projects always have isProject: true
    if (activeChatSession.id === null) return true;
    // Check ChatSession meta for isProject flag
    return Boolean(
      activeChatSession.meta &&
        typeof activeChatSession.meta === "object" &&
        !Array.isArray(activeChatSession.meta) &&
        (activeChatSession.meta as Record<string, unknown>).isProject === true
    );
  })();

  const isPresaved =
    activeChatSession !== null && activeChatSession.id === null;

  return (
    <ChatContext.Provider
      value={{
        activeChatSession,
        setActiveChatSession,
        isProject,
        isPresaved,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

type N8nChatHistory = Database["public"]["Tables"]["n8n_chat_histories"]["Row"];

type N8nMessage = {
  type: "human" | "ai" | "assistant";
  content: string;
};

type N8nNewFormatMessage = {
  output: {
    answer: string;
    follow_up_questions: string[];
  };
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export function useChatMessages(heapId: string | null) {
  const { activeChatSession } = useChat();

  // Only fetch messages if we have an active session with an ID (not pending)
  const sessionId =
    activeChatSession && activeChatSession.id !== null
      ? activeChatSession.id
      : null;

  return useQuery<ChatMessage[], Error>({
    queryKey: ["chat-messages", heapId, sessionId],
    queryFn: async () => {
      if (!heapId || !sessionId) {
        return [];
      }

      const response = await fetch(
        `/api/heaps/${heapId}/chat-sessions/${sessionId}/messages`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load messages");
      }

      const json = (await response.json()) as ApiResponse<N8nChatHistory[]>;
      const histories = json.data || [];

      // Transform n8n chat history format to ChatMessage format
      return histories
        .map((history) => {
          const message = history.message;
          if (!message || typeof message !== "object") {
            return null;
          }

          // Handle format: { type, content }
          const oldFormat = message as N8nMessage;
          if (!oldFormat.type || !oldFormat.content) {
            return null;
          }

          const role = oldFormat.type === "human" ? "user" : "assistant";

          // For assistant messages, check if content is a JSON string with new format
          if (role === "assistant" && typeof oldFormat.content === "string") {
            try {
              const parsedContent = JSON.parse(oldFormat.content);
              // Check for new format: { output: { answer, follow_up_questions } }
              if (
                parsedContent &&
                typeof parsedContent === "object" &&
                !Array.isArray(parsedContent) &&
                "output" in parsedContent &&
                typeof parsedContent.output === "object" &&
                parsedContent.output !== null &&
                !Array.isArray(parsedContent.output) &&
                "answer" in parsedContent.output &&
                typeof parsedContent.output.answer === "string"
              ) {
                const newFormat = parsedContent as N8nNewFormatMessage;
                const answer = newFormat.output.answer;
                const followUpQuestions =
                  newFormat.output.follow_up_questions || [];

                // Format as string with answer and bulleted follow-up questions
                let content = answer;

                // console.log('followUpQuestions', followUpQuestions)
                if (followUpQuestions.length > 0) {
                  content +=
                    "\n\n" + followUpQuestions.map((q) => `• ${q}`).join("\n");
                }

                return {
                  role: "assistant" as const,
                  content,
                } as ChatMessage;
              }
            } catch {
              // If parsing fails, treat content as plain string (old format)
            }
          }

          // Use content as-is (old format or failed JSON parse)
          return {
            role,
            content: oldFormat.content,
          } as ChatMessage;
        })
        .filter((msg): msg is ChatMessage => msg !== null);
    },
    enabled: Boolean(heapId && sessionId),
    staleTime: 30_000, // 30 seconds
  });
}

type SendMessageParams = {
  chatInput: string;
  sessionId?: string | null;
  jobId?: string | null;
};

type SendMessageResponse = {
  message: string;
  sessionId: string;
  jobId: string;
};

export function useSpaceChatSessions(heapId: string | null) {
  return useQuery<ChatSession[], Error>({
    queryKey: ["space-chat-sessions", heapId],
    queryFn: async () => {
      if (!heapId) {
        return [];
      }

      const response = await fetch(`/api/heaps/${heapId}/chat-sessions`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load chat sessions");
      }

      const json = (await response.json()) as ApiResponse<ChatSession[]>;
      const allSessions = json.data || [];

      // Filter out sessions where isProject is true in meta
      return allSessions.filter((session) => {
        if (
          !session.meta ||
          typeof session.meta !== "object" ||
          Array.isArray(session.meta)
        ) {
          return true; // Include sessions without meta or with invalid meta
        }
        const meta = session.meta as Record<string, unknown>;
        return meta.isProject !== true;
      });
    },
    enabled: Boolean(heapId),
    staleTime: 30_000, // 30 seconds
  });
}

export function useSendChatMessage(heapId: string | null) {
  const { activeChatSession, setActiveChatSession, isProject } = useChat();
  const queryClient = useQueryClient();

  const sessionId =
    activeChatSession && activeChatSession.id !== null
      ? activeChatSession.id
      : null;

  return useMutation<SendMessageResponse, Error, SendMessageParams>({
    mutationFn: async ({
      chatInput,
      sessionId: overrideSessionId,
      jobId: overrideJobId,
    }) => {
      if (!heapId) {
        throw new Error("heapId is required");
      }

      // Use override sessionId if provided, otherwise use context sessionId
      const finalSessionId = overrideSessionId ?? sessionId;
      const finalJobId =
        overrideJobId && overrideJobId.trim().length > 0
          ? overrideJobId
          : undefined;

      const requestBody: Record<string, unknown> = {
        chatInput,
        sessionId: finalSessionId,
        isProject,
        ...(finalJobId ? { jobId: finalJobId } : {}),
      };

      // Include meta and filter from activeChatSession if available
      if (activeChatSession?.meta !== undefined) {
        requestBody.meta = activeChatSession.meta;
      }

      // Check for filter or filters field (database uses filters, but API accepts filter)
      const sessionFilter = activeChatSession?.filter;
      if (sessionFilter !== undefined) {
        requestBody.filter = sessionFilter;
      }

      const response = await fetch(`/api/heaps/${heapId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      const data = (await response.json()) as ApiResponse<SendMessageResponse>;
      if (data.error) {
        throw new Error(data.error);
      }

      console.log("data", data);

      return {
        ...data.data!,
        jobId: data.data?.jobId ?? finalJobId ?? "",
      };
    },
    onSuccess: async (data, variables) => {
      // If a new session was created (for space chat), update the active session
      const finalSessionId = variables.sessionId ?? sessionId;
      if (
        data.sessionId &&
        (!finalSessionId || data.sessionId !== finalSessionId)
      ) {
        // Fetch all sessions to find the new one
        const sessionsResponse = await fetch(
          `/api/heaps/${heapId}/chat-sessions`,
          { cache: "no-store" }
        );
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          if (sessionsData.data) {
            const newSession = (sessionsData.data as ChatSession[]).find(
              (s) => s.id === data.sessionId
            );
            if (newSession) {
              setActiveChatSession(newSession);
            }
          }
        }
        // Invalidate space chat sessions query to include the new session
        await queryClient.invalidateQueries({
          queryKey: ["space-chat-sessions", heapId],
        });
      }

      // Refetch messages after sending
      await queryClient.invalidateQueries({
        queryKey: ["chat-messages", heapId, data.sessionId || finalSessionId],
      });
    },
  });
}
