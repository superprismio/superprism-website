"use client";

import { Button } from "@/components/ui/button";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceFeed({ onOpenPaneTwo }: WorkspacePaneComponentProps) {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <p>Stay up to date with the latest activity happening in this space.</p>
      <Button
        size="sm"
        onClick={() => onOpenPaneTwo("spaceChat")}
        className="w-fit"
      >
        Open Space Chat
      </Button>
    </div>
  );
}


