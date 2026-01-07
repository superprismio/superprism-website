"use client";

import {
  ComponentType,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useHeap } from "../../hooks/useSpaces";
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
import { SpaceSettings } from "./space-settings";
import { SpaceProjects } from "./space-projects";
import { SpacePublish } from "./space-publish";
import { UserProfile } from "./user-profile";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

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
  spacePublish: {
    label: "Publish",
    component: SpacePublish,
  },
  spaceSettings: {
    label: "Settings",
    component: SpaceSettings,
  },
  userProfile: {
    label: "User Profile",
    component: UserProfile,
  },
};

const DEFAULT_PRIMARY: WorkspacePaneKey = "spaceFeed";
const DEFAULT_SECONDARY: WorkspacePaneKey = "spaceChat";

// URL param mapping: section param -> WorkspacePaneKey
const SECTION_TO_PANE: Record<string, WorkspacePaneKey> = {
  settings: "spaceSettings",
  projects: "spaceProjects",
  knowledge: "knowledgeExplorer",
};

// Reverse mapping: WorkspacePaneKey -> section param
const PANE_TO_SECTION: Partial<Record<WorkspacePaneKey, string>> = {
  spaceSettings: "settings",
  spaceProjects: "projects",
  knowledgeExplorer: "knowledge",
};

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [primaryPane, setPrimaryPane] =
    useState<WorkspacePaneKey>(DEFAULT_PRIMARY);
  const [secondaryPane, setSecondaryPane] = useState<WorkspacePaneKey | null>(
    DEFAULT_SECONDARY
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isSecondaryDialogOpen, setIsSecondaryDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isUserProfileDialogOpen, setIsUserProfileDialogOpen] = useState(false);

  // Read URL params on mount and when they change
  useEffect(() => {
    const section = searchParams.get("section");

    // Map section param to pane
    if (section && SECTION_TO_PANE[section]) {
      const newPane = SECTION_TO_PANE[section];
      // Only update if different to avoid unnecessary re-renders
      if (newPane !== primaryPane) {
        setPrimaryPane(newPane);
      }
    }

    // Note: projectId and fileId are passed to components below
    // They will be handled by SpaceProjects and KnowledgeExplorer respectively
  }, [searchParams, primaryPane]);

  // Update URL when primary pane changes
  const updateUrlParams = useCallback(
    (
      pane: WorkspacePaneKey,
      projectId?: string | null,
      fileId?: string | null
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update section param
      const section = PANE_TO_SECTION[pane];
      if (section) {
        params.set("section", section);
      } else {
        // Remove section if it's not a mappable pane
        params.delete("section");
      }

      // Clear ingest param when navigating away from knowledge section
      if (pane !== "knowledgeExplorer") {
        params.delete("ingest");
      }

      // Update projectId param
      if (projectId) {
        params.set("projectId", projectId);
      } else {
        params.delete("projectId");
      }

      // Update fileId param
      if (fileId) {
        params.set("fileId", fileId);
      } else {
        params.delete("fileId");
      }

      // Only update URL if params actually changed
      const newParamsString = params.toString();
      const currentParamsString = searchParams.toString();
      if (newParamsString !== currentParamsString) {
        router.replace(`${pathname}?${newParamsString}`, { scroll: false });
      }
    },
    [searchParams, router, pathname]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleSelectPrimary = useCallback(
    (pane: WorkspacePaneKey) => {
      setPrimaryPane(pane);
      // Clear projectId and fileId when switching primary panes
      updateUrlParams(pane, null, null);
    },
    [updateUrlParams]
  );

  const handleOpenUserProfile = useCallback(() => {
    setIsUserProfileDialogOpen(true);
  }, []);

  const handleOpenSecondary = useCallback((pane: WorkspacePaneKey) => {
    setSecondaryPane(pane);
  }, []);

  const handleOpenChatDialog = useCallback(() => {
    setIsChatDialogOpen(true);
  }, []);

  const PrimaryComponent = PANE_DEFINITIONS[primaryPane].component;
  const SecondaryComponent = secondaryPane
    ? PANE_DEFINITIONS[secondaryPane].component
    : null;

  // Extract URL params for passing to components
  const urlProjectId = searchParams.get("projectId");
  const urlFileId = searchParams.get("fileId");
  const urlIngest = searchParams.get("ingest");

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
      <div className="h-full">
        <div
          className={`flex flex-col h-full md:grid ${layoutColumns}`}
          role="region"
          aria-label="Workspace layout"
        >
          <SpaceNav
            activePrimary={primaryPane}
            activeSecondary={secondaryPane}
            onSelect={handleSelectPrimary}
            onOpenChatDialog={handleOpenChatDialog}
            isMobile={isMobile}
            heapId={spaceId}
            onOpenUserProfile={handleOpenUserProfile}
          />
          {SecondaryComponent ? (
            isMobile ? (
              <>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <PaneOne title={primaryDefinition.label}>
                    <PrimaryComponent
                      onOpenPaneTwo={handleOpenSecondary}
                      heapId={spaceId}
                      projectId={urlProjectId}
                      fileId={urlFileId}
                      ingest={urlIngest}
                    />
                  </PaneOne>
                </div>
                <PaneTwo
                  title={secondaryDefinition?.label}
                  isMobile={true}
                  onExpand={() => setIsSecondaryDialogOpen(true)}
                >
                  <SecondaryComponent
                    onOpenPaneTwo={handleOpenSecondary}
                    heapId={spaceId}
                    projectId={urlProjectId}
                    fileId={urlFileId}
                    ingest={urlIngest}
                  />
                </PaneTwo>
                <Dialog
                  open={isSecondaryDialogOpen}
                  onOpenChange={setIsSecondaryDialogOpen}
                >
                  <DialogContent className="max-w-full h-[90vh] flex flex-col p-0">
                    <DialogTitle className="sr-only">
                      {secondaryDefinition?.label}
                    </DialogTitle>
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                      <SecondaryComponent
                        onOpenPaneTwo={handleOpenSecondary}
                        heapId={spaceId}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <ResizablePanelGroup
                direction="horizontal"
                className="flex h-full min-h-[320px] flex-col"
              >
                <ResizablePanel
                  defaultSize={60}
                  minSize={10}
                  className="md:min-w-[280px]"
                >
                  <PaneOne title={primaryDefinition.label}>
                    <PrimaryComponent
                      onOpenPaneTwo={handleOpenSecondary}
                      heapId={spaceId}
                      projectId={urlProjectId}
                      fileId={urlFileId}
                      ingest={urlIngest}
                    />
                  </PaneOne>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize={40}
                  minSize={10}
                  className="md:min-w-[240px]"
                >
                  <PaneTwo title={secondaryDefinition?.label}>
                    <SecondaryComponent
                      onOpenPaneTwo={handleOpenSecondary}
                      heapId={spaceId}
                    />
                  </PaneTwo>
                </ResizablePanel>
              </ResizablePanelGroup>
            )
          ) : (
            <>
              <PaneOne title={primaryDefinition.label}>
                <PrimaryComponent
                  onOpenPaneTwo={handleOpenSecondary}
                  heapId={spaceId}
                  projectId={urlProjectId}
                  fileId={urlFileId}
                  ingest={urlIngest}
                />
              </PaneOne>
              <PaneTwo title={secondaryDefinition?.label} />
            </>
          )}
        </div>
      </div>
      {/* Mobile chat dialog */}
      {isMobile && (
        <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
          <DialogContent className="max-w-full h-[90vh] flex flex-col p-0">
            <DialogTitle className="sr-only">
              {PANE_DEFINITIONS.spaceChat.label}
            </DialogTitle>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <SpaceChat onOpenPaneTwo={handleOpenSecondary} heapId={spaceId} />
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* User profile dialog */}
      <Dialog open={isUserProfileDialogOpen} onOpenChange={setIsUserProfileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">
            {PANE_DEFINITIONS.userProfile.label}
          </DialogTitle>
          <UserProfile heapId={spaceId} />
        </DialogContent>
      </Dialog>
    </ChatProvider>
  );
}
