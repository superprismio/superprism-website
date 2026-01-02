"use client";

import { ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "../ui/button";
import { useChat } from "@/hooks/useChat";

type PaneTwoProps = {
  title?: string;
  children?: ReactNode;
  isMobile?: boolean;
  onExpand?: () => void;
};

function getChatTitle(isProject: boolean): string {
  return isProject ? "Chat with Project" : "Chat with Space";
}

export function PaneTwo({
  children,
  title,
  isMobile = false,
  onExpand,
}: PaneTwoProps) {
  const { isProject } = useChat();
  
  // Use dynamic title for chat, fallback to provided title
  const displayTitle =
    title === "Chat with Space" ? getChatTitle(isProject) : title;

  if (isMobile) {
    return (
      <aside className="flex h-[60px] flex-shrink-0 border-t items-center justify-between px-3 bg-background">
        <h3 className="font-semibold text-foreground">{displayTitle}</h3>
        {onExpand && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onExpand}
            aria-label="Expand"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </aside>
    );
  }

  return <aside className="flex h-full min-h-[320px] flex-col">{children}</aside>;
}
