"use client";

import { ComponentType, ReactNode, useCallback, useState, useEffect } from "react";
import { useHeap } from "../../hooks/spaces";
import { ChatProvider, useChat } from "../../hooks/useChat";
import { SpaceNav } from "./space-nav";
import { PaneOne } from "./pane-one";
import { PaneTwo } from "./pane-two";
import {
  WorkspacePaneComponentProps,
  WorkspacePaneKey,
} from "./workspace-pane-types";
import { SpaceFeed } from "./space-feed";
import { KnowledgeExplorer } from "./knowledge-explorer";
import { SpaceChat } from "./space-chat";
import { SpaceMembers } from "./space-members";
import { SpaceSettings } from "./space-settings";
import { SpaceProjects } from "./space-projects";
import { SpacePublish } from "./space-publish";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

type WorkspaceProps = {
  spaceId: string | null;
  isLoadingList?: boolean;
  emptyStateAction?: ReactNode;
};

type PaneDefinition = {
  label: string;
  component: ComponentType<WorkspacePaneComponentProps>;
};

const PANE_DEFINITIONS: Record<WorkspacePaneKey, PaneDefinition> = {
  spaceFeed: {
    label: "Feed",
    component: SpaceFeed,
  },
  knowledgeExplorer: {
    label: "Knowledge Explorer",
    component: KnowledgeExplorer,
  },
  spaceChat: {
    label: "Chat with Space",
    component: SpaceChat,
  },
  spaceProjects: {
    label: "Projects",
    component: SpaceProjects,
  },
  spaceMembers: {
    label: "Members",
    component: SpaceMembers,
  },
  spacePublish: {
    label: "Publish",
    component: SpacePublish,
  },
  spaceSettings: {
    label: "Settings",
    component: SpaceSettings,
  },
};

const DEFAULT_PRIMARY: WorkspacePaneKey = "spaceFeed";
const DEFAULT_SECONDARY: WorkspacePaneKey = "spaceChat";

// Component to monitor pane changes and clear active chat session when navigating away from the Projects workspace
function ProjectPaneMonitor({
  primaryPane,
}: {
  primaryPane: WorkspacePaneKey;
}) {
  const { activeChatSession, isProject, setActiveChatSession } = useChat();

  useEffect(() => {
    // Only keep projects active when in the Projects workspace (spaceProjects primary pane)
    // Clear project when navigating away from spaceProjects, even if going to knowledgeExplorer
    const shouldClearProject =
      isProject &&
      activeChatSession !== null &&
      primaryPane !== "spaceProjects";

    if (shouldClearProject) {
      setActiveChatSession(null);
    }
  }, [primaryPane, isProject, activeChatSession, setActiveChatSession]);

  return null;
}

export function Workspace({
  spaceId,
  isLoadingList = false,
  emptyStateAction,
}: WorkspaceProps) {
  const { data: space, isPending, isError, error } = useHeap(spaceId);

  const [primaryPane, setPrimaryPane] =
    useState<WorkspacePaneKey>(DEFAULT_PRIMARY);
  const [secondaryPane, setSecondaryPane] = useState<WorkspacePaneKey | null>(
    DEFAULT_SECONDARY
  );

  const handleSelectPrimary = useCallback((pane: WorkspacePaneKey) => {
    setPrimaryPane(pane);
  }, []);

  const handleOpenSecondary = useCallback((pane: WorkspacePaneKey) => {
    setSecondaryPane(pane);
  }, []);

  const PrimaryComponent = PANE_DEFINITIONS[primaryPane].component;
  const SecondaryComponent = secondaryPane
    ? PANE_DEFINITIONS[secondaryPane].component
    : null;

  const layoutColumns = SecondaryComponent
    ? "md:grid-cols-[72px,minmax(0,1fr)]"
    : "md:grid-cols-[72px,minmax(0,1fr),112px]";

  if (isLoadingList || (spaceId && isPending)) {
    return (
      <div className="px-6 py-10">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!spaceId) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          You haven&apos;t created any spaces yet.
        </p>
        {emptyStateAction}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 px-6 py-8 text-sm text-destructive">
        {error?.message ?? "Unable to load the selected space."}
      </div>
    );
  }

  if (!space) {
    return null;
  }

  const primaryDefinition = PANE_DEFINITIONS[primaryPane];
  const secondaryDefinition = secondaryPane
    ? PANE_DEFINITIONS[secondaryPane]
    : null;

  return (
    <ChatProvider>
      <ProjectPaneMonitor primaryPane={primaryPane} />
      <div>
        <div
          className={`flex flex-col min-h-[calc(100vh)] md:grid ${layoutColumns}`}
          role="region"
          aria-label="Workspace layout"
        >
          <SpaceNav
            activePrimary={primaryPane}
            activeSecondary={secondaryPane}
            onSelect={handleSelectPrimary}
          />
          {SecondaryComponent ? (
            <ResizablePanelGroup
              direction="horizontal"
              className="flex min-h-[320px] flex-col"
            >
              <ResizablePanel
                defaultSize={60}
                minSize={10}
                className="min-w-[280px]"
              >
                <PaneOne title={primaryDefinition.label}>
                  <PrimaryComponent
                    onOpenPaneTwo={handleOpenSecondary}
                    heapId={spaceId}
                  />
                </PaneOne>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={40}
                minSize={10}
                className="min-w-[240px]"
              >
                <PaneTwo title={secondaryDefinition?.label}>
                  <SecondaryComponent
                    onOpenPaneTwo={handleOpenSecondary}
                    heapId={spaceId}
                  />
                </PaneTwo>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <>
              <PaneOne title={primaryDefinition.label}>
                <PrimaryComponent
                  onOpenPaneTwo={handleOpenSecondary}
                  heapId={spaceId}
                />
              </PaneOne>
              <PaneTwo title={secondaryDefinition?.label} />
            </>
          )}
        </div>
      </div>
    </ChatProvider>
  );
}
