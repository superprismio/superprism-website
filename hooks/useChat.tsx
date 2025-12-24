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
  filters?: Record<string, unknown>;
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
          const message = history.message as N8nMessage;
          if (!message || typeof message !== "object" || !message.type || !message.content) {
            return null;
          }
          
          return {
            role: message.type === "human" ? "user" : "assistant",
            content: message.content,
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
};

type SendMessageResponse = {
  message: string;
  sessionId: string;
};

export function useSendChatMessage(heapId: string | null) {
  const { activeChatSession, setActiveChatSession, isProject } = useChat();
  const queryClient = useQueryClient();

  const sessionId =
    activeChatSession && activeChatSession.id !== null
      ? activeChatSession.id
      : null;

  return useMutation<SendMessageResponse, Error, SendMessageParams>({
    mutationFn: async ({ chatInput }) => {
      if (!heapId) {
        throw new Error("heapId is required");
      }

      const requestBody: Record<string, unknown> = {
        chatInput,
        sessionId,
        isProject,
      };

      // Include meta and filter from activeChatSession if available
      if (activeChatSession?.meta !== undefined) {
        requestBody.meta = activeChatSession.meta;
      }

      // Check for filter or filters field (database uses filters, but API accepts filter)
      const sessionFilter = activeChatSession?.filters;
      if (sessionFilter !== undefined) {
        requestBody.filter = sessionFilter;
      }

      console.log("activeChatSession", activeChatSession);  
      console.log("requestBody", requestBody);        


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

      return data.data!;
    },
    onSuccess: async (data) => {
      // If a new session was created (for space chat), update the active session
      if (data.sessionId && (!sessionId || data.sessionId !== sessionId)) {
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
      }

      // Refetch messages after sending
      await queryClient.invalidateQueries({
        queryKey: ["chat-messages", heapId, data.sessionId || sessionId],
      });
    },
  });
}
