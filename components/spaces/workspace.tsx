"use client";

import { ComponentType, ReactNode, useCallback, useState } from "react";
import { useHeap } from "./hooks";
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
    label: "Space Feed",
    component: SpaceFeed,
  },
  knowledgeExplorer: {
    label: "Knowledge Explorer",
    component: KnowledgeExplorer,
  },
  spaceChat: {
    label: "Space Chat",
    component: SpaceChat,
  },
  spaceMembers: {
    label: "Space Members",
    component: SpaceMembers,
  },
  spaceSettings: {
    label: "Space Settings",
    component: SpaceSettings,
  },
};

const DEFAULT_PRIMARY: WorkspacePaneKey = "spaceFeed";

export function Workspace({
  spaceId,
  isLoadingList = false,
  emptyStateAction,
}: WorkspaceProps) {
  const { data: space, isPending, isError, error } = useHeap(spaceId);

  const [primaryPane, setPrimaryPane] =
    useState<WorkspacePaneKey>(DEFAULT_PRIMARY);
  const [secondaryPane, setSecondaryPane] = useState<WorkspacePaneKey | null>(
    null
  );

  const handleSelectPrimary = useCallback((pane: WorkspacePaneKey) => {
    setPrimaryPane(pane);
  }, []);

  const handleOpenSecondary = useCallback((pane: WorkspacePaneKey) => {
    setSecondaryPane(pane);
  }, []);

  const handleCloseSecondary = useCallback(() => {
    setSecondaryPane(null);
  }, []);

  const layoutColumns = secondaryPane
    ? "md:grid-cols-[72px,minmax(0,1fr),minmax(0,320px)]"
    : "md:grid-cols-[72px,minmax(0,1fr),112px]";

  const PrimaryComponent = PANE_DEFINITIONS[primaryPane].component;
  const SecondaryComponent = secondaryPane
    ? PANE_DEFINITIONS[secondaryPane].component
    : null;

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
    <div>
      <div
        className={`flex flex-col gap-4 min-h-[calc(100vh)] md:grid ${layoutColumns}`}
        role="region"
        aria-label="Workspace layout"
      >
        <SpaceNav
          activePrimary={primaryPane}
          activeSecondary={secondaryPane}
          onSelect={handleSelectPrimary}
        />
        <PaneOne
          title={primaryDefinition.label}
          description={space.description}
        >
          <PrimaryComponent onOpenPaneTwo={handleOpenSecondary} />
        </PaneOne>
        <PaneTwo
          isOpen={Boolean(SecondaryComponent)}
          title={secondaryDefinition?.label}
          onClose={handleCloseSecondary}
        >
          {SecondaryComponent ? (
            <SecondaryComponent onOpenPaneTwo={handleOpenSecondary} />
          ) : null}
        </PaneTwo>
      </div>
    </div>
  );
}
