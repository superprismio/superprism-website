"use client";

import { useState, useCallback, useEffect } from "react";
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
import { useSpaceFiles } from "@/hooks/useSpaceFiles";
import { useChat } from "@/hooks/useChat";
import type { Database } from "@/lib/types/supabase";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { generateShareUrl } from "@/lib/share-link";
import { ShareButton } from "./share-button";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; file_id: string[] };
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

type KnowledgeExplorerProps = WorkspacePaneComponentProps & {
  useDialogForPreview?: boolean;
};

export function KnowledgeExplorer({
  heapId,
  useDialogForPreview = false,
  fileId,
  ingest,
}: KnowledgeExplorerProps) {
  const { deleteFile, updateFileVisibility, files } = useSpaceFiles(heapId);
  const { setActiveChatSession } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [secondaryView, setSecondaryView] = useState<SecondaryView>("graph");
  const [previewFile, setPreviewFile] = useState<FileRow | null>(null);

  // Map ingest param to secondaryView (only if fileId is not set, as file preview takes precedence)
  useEffect(() => {
    // Don't set ingest view if fileId is set (file preview takes precedence)
    if (fileId) return;

    if (ingest === "upload" && secondaryView !== "upload") {
      setSecondaryView("upload");
    } else if (ingest === "text" && secondaryView !== "text-editor") {
      setSecondaryView("text-editor");
    } else if (!ingest && (secondaryView === "upload" || secondaryView === "text-editor")) {
      // If ingest param is removed and we're on an ingest view, reset to graph
      setSecondaryView("graph");
    }
  }, [ingest, fileId, secondaryView]);

  // Find and set preview file when fileId is provided in URL
  // Skip this when in dialog mode (useDialogForPreview) since dialog previews shouldn't sync with URL
  useEffect(() => {
    if (useDialogForPreview) return;
    
    if (fileId && files.length > 0) {
      const file = files.find((f) => f.id === fileId);
      if (file) {
        // Only update if the preview file is different from the URL file
        if (previewFile?.id !== fileId) {
          setPreviewFile(file);
        }
      }
    } else if (!fileId && previewFile) {
      // Clear preview if fileId is removed from URL
      setPreviewFile(null);
    }
  }, [fileId, files, previewFile, useDialogForPreview]);

  // Update URL when file preview changes
  const updateUrlWithFile = useCallback(
    (file: FileRow | null) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (file) {
        params.set("fileId", file.id);
        // Ensure section is set to knowledge
        params.set("section", "knowledge");
        // Clear ingest when showing file preview
        params.delete("ingest");
      } else {
        params.delete("fileId");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Update URL when secondary view changes (for ingest views)
  const updateUrlWithIngest = useCallback(
    (view: SecondaryView) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Ensure section is set to knowledge
      params.set("section", "knowledge");
      
      if (view === "upload") {
        params.set("ingest", "upload");
        // Clear fileId when showing upload
        params.delete("fileId");
      } else if (view === "text-editor") {
        params.set("ingest", "text");
        // Clear fileId when showing text editor
        params.delete("fileId");
      } else {
        // Clear ingest for other views
        params.delete("ingest");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );
  const [pendingProject, setPendingProject] = useState<PendingProject | null>(
    null
  );
  const [createdProject, setCreatedProject] = useState<ChatSession | null>(
    null
  );
  const [editorContent, setEditorContent] = useState<string>("");
  const [editorFileId, setEditorFileId] = useState<string | undefined>(
    undefined
  );
  const [editorFileName, setEditorFileName] = useState<string | undefined>(
    undefined
  );

  const showGraph = () => {
    setSecondaryView("graph");
    // Don't update URL here - let handleSelectView handle URL updates for user interactions
    // or let useEffect sync from URL params
  };

  const showPreview = (file: FileRow) => {
    setPreviewFile(file);
    // Only update URL when not in dialog mode
    if (!useDialogForPreview) {
      updateUrlWithFile(file);
    }
  };

  const handleSelectView = (view: SecondaryView) => {
    // Clear preview when switching to a different view
    if (view !== "preview") {
      setPreviewFile(null);
      updateUrlWithFile(null);
    }
    if (view === "text-editor" && !editorFileId) {
      // Clear editor state when opening from menu (not from edit)
      setEditorContent("");
      setEditorFileId(undefined);
      setEditorFileName(undefined);
    }
    setSecondaryView(view);
    // Update URL for ingest views
    if (view === "upload" || view === "text-editor") {
      updateUrlWithIngest(view);
    } else if (view !== "preview") {
      // Clear ingest param for other views (except preview, which handles its own URL)
      updateUrlWithIngest(view);
    }
  };

  const getOrCreatePendingProject = useCallback((): PendingProject => {
    if (pendingProject) {
      return pendingProject;
    }
    return {
      id: null,
      title: "New Project",
      meta: { isProject: true, file_id: [] },
      created_at: null,
    };
  }, [pendingProject]);

  const handleAddFileToProject = useCallback(
    (file: FileRow) => {
      // If in projects workspace, use the window function
      if (
        useDialogForPreview &&
        (window as unknown as { addFileToProject?: (fileId: string) => void })
          .addFileToProject
      ) {
        (
          window as unknown as { addFileToProject: (fileId: string) => void }
        ).addFileToProject(file.id);
        return;
      }

      // Otherwise, use the local pending project logic
      const pending = getOrCreatePendingProject();
      if (!pending.meta.file_id.includes(file.id)) {
        const updatedPending: PendingProject = {
          ...pending,
          meta: {
            ...pending.meta,
            file_id: [...pending.meta.file_id, file.id],
          },
        };
        setPendingProject(updatedPending);
        setActiveChatSession(updatedPending);
        setSecondaryView("project");
      }
    },
    [getOrCreatePendingProject, useDialogForPreview, setActiveChatSession]
  );

  const handleUpdatePendingProject = useCallback(
    (fileIds: string[]) => {
      if (pendingProject) {
        const updatedPending: PendingProject = {
          ...pendingProject,
          meta: {
            ...pendingProject.meta,
            file_id: fileIds,
          },
        };
        setPendingProject(updatedPending);
        setActiveChatSession(updatedPending);
      }
    },
    [pendingProject, setActiveChatSession]
  );

  const handleUpdatePendingProjectTitle = useCallback(
    (title: string) => {
      if (pendingProject) {
        const updatedPending: PendingProject = {
          ...pendingProject,
          title,
        };
        setPendingProject(updatedPending);
        setActiveChatSession(updatedPending);
      }
    },
    [pendingProject, setActiveChatSession]
  );

  const handleProjectCreated = useCallback(
    (project: ChatSession) => {
      setPendingProject(null);
      setCreatedProject(project);
      setActiveChatSession(project);
      // Keep the project view open
    },
    [setActiveChatSession]
  );

  const handleProjectUpdated = useCallback(
    (project: ChatSession) => {
      setCreatedProject(project);
      setActiveChatSession(project);
    },
    [setActiveChatSession]
  );

  const handleCloseProject = useCallback(() => {
    setCreatedProject(null);
    setPendingProject(null);
    setActiveChatSession(null);
    setSecondaryView("graph");
  }, [setActiveChatSession]);

  const handleEditFile = useCallback((file: FileRow, content: string) => {
    setEditorContent(content);
    setEditorFileId(file.id);
    setEditorFileName(file.file_name || undefined);
    setSecondaryView("text-editor");
  }, []);

  const handleToggleVisibility = useCallback(
    async (fileId: string, visibility: "public" | "private") => {
      try {
        await updateFileVisibility(fileId, visibility);
      } catch (error) {
        console.error("Failed to toggle file visibility:", error);
        throw error;
      }
    },
    [updateFileVisibility]
  );

  const handleDeleteFile = useCallback(
    async (fileId: string) => {
      await deleteFile(fileId);
    },
    [deleteFile]
  );

  const renderSecondaryContent = () => {
    switch (secondaryView) {
      case "graph":
        return (
          <ScrollArea className="flex-1 min-h-0 h-full">
            <KnowledgeGraph heapId={heapId} />;
          </ScrollArea>
        );
      case "project":
        return pendingProject || createdProject ? (
          <ProjectDetail
            key={createdProject?.id ?? pendingProject?.id ?? "pending"}
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
        return (
          <TextEditor
            key="text-editor"
            heapId={heapId}
            initialMarkdown={editorContent}
            fileId={editorFileId}
            initialFileName={editorFileName}
            onClose={() => {
              setSecondaryView("graph");
              // Clear ingest param when closing text editor
              updateUrlWithIngest("graph");
            }}
          />
        );
      case "upload":
        return (
          <FileUpload
            key="upload"
            heapId={heapId}
            onClose={() => {
              setSecondaryView("graph");
              // Clear ingest param when closing upload
              updateUrlWithIngest("graph");
            }}
          />
        );
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

  console.log("useDialogForPreview", useDialogForPreview);
  console.log("previewFile", previewFile);


  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between items-center">
        <h3 className="font-semibold text-foreground">
          {useDialogForPreview
            ? `Add Knowledge to Project`
            : `Knowledge Explorer`}
        </h3>
        {!useDialogForPreview && (
          <div className="flex items-center gap-2">
            <ShareButton
              url={generateShareUrl(heapId, {
                section: "knowledge",
                fileId: previewFile?.id ?? fileId ?? null,
                ingest:
                  secondaryView === "upload"
                    ? "upload"
                    : secondaryView === "text-editor"
                    ? "text"
                    : null,
              })}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Add Knowledge</Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background">
              <DropdownMenuItem
                onSelect={() => handleSelectView("text-editor")}
              >
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
          </div>
        )}
      </header>

      <ResizablePanelGroup direction="vertical" className="flex flex-1 min-h-0">
        <ResizablePanel
          defaultSize={60}
          minSize={10}
          className="flex flex-col min-h-0 overflow-hidden relative"
        >
          <FileExplorer
            heapId={heapId}
            onPreviewFile={showPreview}
            selectedFileId={previewFile?.id ?? null}
            onAddFileToChat={handleAddFileToProject}
            useDialogForPreview={useDialogForPreview}
          />
          {previewFile && !useDialogForPreview && (
            <div className="absolute inset-0 bg-background z-10 flex flex-col">
              <ScrollArea className="flex-1 min-h-0 h-full">
                <FilePreview
                  key={previewFile.id}
                  file={previewFile}
                  onClose={() => {
                    setPreviewFile(null);
                    updateUrlWithFile(null);
                  }}
                  heapId={heapId}
                  onEditFile={handleEditFile}
                  onToggleVisibility={handleToggleVisibility}
                  onDeleteFile={handleDeleteFile}
                  useDialog={useDialogForPreview}
                />
              </ScrollArea>
            </div>
          )}
        </ResizablePanel>
        {!useDialogForPreview && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={10}>
              {renderSecondaryContent()}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      {useDialogForPreview && previewFile && (
        <FilePreview
          key={previewFile.id}
          file={previewFile}
          onClose={() => {
            setPreviewFile(null);
            // Don't update URL in dialog mode
          }}
          heapId={heapId}
          onEditFile={handleEditFile}
          onToggleVisibility={handleToggleVisibility}
          onDeleteFile={handleDeleteFile}
          useDialog={useDialogForPreview}
        />
      )}
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
