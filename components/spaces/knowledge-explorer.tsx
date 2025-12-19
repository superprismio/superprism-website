"use client";

import { useState, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FileExplorer } from "./file-explorer";
import { FileUpload } from "./file-upload";
import { KnowledgeGraph } from "./knowledge-graph";
import { TextEditor } from "./text-editor";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import { FilePreview } from "./file-preview";
import { FileRow } from "./types";
import { ProjectDetail } from "./project-detail";
import type { Database } from "@/lib/types/supabase";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; fileIds: string[] };
  created_at: null;
};

type SecondaryView =
  | "graph"
  | "preview"
  | "text-editor"
  | "upload"
  | "scrape-web"
  | "import-drive"
  | "ingest-api"
  | "ingest-mcp"
  | "project";

export function KnowledgeExplorer({ heapId }: WorkspacePaneComponentProps) {
  const [secondaryView, setSecondaryView] = useState<SecondaryView>("graph");
  const [previewFile, setPreviewFile] = useState<FileRow | null>(null);
  const [pendingProject, setPendingProject] = useState<PendingProject | null>(null);
  const [createdProject, setCreatedProject] = useState<ChatSession | null>(null);

  const showGraph = () => setSecondaryView("graph");

  const showPreview = (file: FileRow) => {
    setPreviewFile(file);
    setSecondaryView("preview");
  };

  const handleSelectView = (view: SecondaryView) => {
    if (view !== "preview") {
      setPreviewFile(null);
    }
    setSecondaryView(view);
  };

  const getOrCreatePendingProject = useCallback((): PendingProject => {
    if (pendingProject) {
      return pendingProject;
    }
    return {
      id: null,
      title: "New Project",
      meta: { isProject: true, fileIds: [] },
      created_at: null,
    };
  }, [pendingProject]);

  const handleAddFileToProject = useCallback((file: FileRow) => {
    const pending = getOrCreatePendingProject();
    if (!pending.meta.fileIds.includes(file.id)) {
      const updatedPending: PendingProject = {
        ...pending,
        meta: {
          ...pending.meta,
          fileIds: [...pending.meta.fileIds, file.id],
        },
      };
      setPendingProject(updatedPending);
      setSecondaryView("project");
    }
  }, [getOrCreatePendingProject]);

  const handleUpdatePendingProject = useCallback((fileIds: string[]) => {
    if (pendingProject) {
      const updatedPending: PendingProject = {
        ...pendingProject,
        meta: {
          ...pendingProject.meta,
          fileIds,
        },
      };
      setPendingProject(updatedPending);
    }
  }, [pendingProject]);

  const handleUpdatePendingProjectTitle = useCallback((title: string) => {
    if (pendingProject) {
      const updatedPending: PendingProject = {
        ...pendingProject,
        title,
      };
      setPendingProject(updatedPending);
    }
  }, [pendingProject]);

  const handleProjectCreated = useCallback((project: ChatSession) => {
    setPendingProject(null);
    setCreatedProject(project);
    // Keep the project view open
  }, []);

  const handleProjectUpdated = useCallback((project: ChatSession) => {
    setCreatedProject(project);
  }, []);

  const handleCloseProject = useCallback(() => {
    setCreatedProject(null);
    setPendingProject(null);
    setSecondaryView("graph");
  }, []);

  const renderSecondaryContent = () => {
    switch (secondaryView) {
      case "graph":
        return <KnowledgeGraph heapId={heapId} />;
      case "preview":
        return (
          <FilePreview file={previewFile} onClose={showGraph} heapId={heapId} />
        );
      case "project":
        return (pendingProject || createdProject) ? (
          <ProjectDetail
            heapId={heapId}
            project={createdProject || pendingProject}
            onUpdatePendingProject={handleUpdatePendingProject}
            onUpdatePendingProjectTitle={handleUpdatePendingProjectTitle}
            onProjectCreated={handleProjectCreated}
            onProjectUpdated={handleProjectUpdated}
            onClose={handleCloseProject}
          />
        ) : null;
      case "text-editor":
        return <TextEditor heapId={heapId} />;
      case "upload":
        return <FileUpload heapId={heapId} />;
      case "scrape-web":
        return <PlaceholderPane title="Scrape Web" />;
      case "import-drive":
        return <PlaceholderPane title="Import from Drive" />;
      case "ingest-api":
        return <PlaceholderPane title="Ingest from API" />;
      case "ingest-mcp":
        return <PlaceholderPane title="Ingest from MCP" />;
      default:
        return null;
    }
  };

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Knowledge Explorer</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Add Knowledge</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background">
            <DropdownMenuItem onSelect={() => handleSelectView("text-editor")}>
              Text Editor
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelectView("upload")}>
              Upload
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleSelectView("scrape-web")}
              disabled={true}
            >
              Scrape Web
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleSelectView("import-drive")}
              disabled={true}
            >
              Import from Drive
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleSelectView("ingest-api")}
              disabled={true}
            >
              Ingest from API
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleSelectView("ingest-mcp")}
              disabled={true}
            >
              Ingest from MCP
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ResizablePanelGroup direction="vertical" className="flex min-h-screen">
        <ResizablePanel defaultSize={60} minSize={10}>
          <div className="h-full overflow-y-auto">
            <FileExplorer
              heapId={heapId}
              onPreviewFile={showPreview}
              selectedFileId={previewFile?.id ?? null}
              onAddFileToChat={handleAddFileToProject}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={10}>
          {renderSecondaryContent()}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}

function PlaceholderPane({ title }: { title: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <h4 className="text-lg font-semibold text-muted-foreground">{title}</h4>
    </div>
  );
}
