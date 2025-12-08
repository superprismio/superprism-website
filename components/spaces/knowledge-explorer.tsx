"use client";

import { useState } from "react";
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
import type { FileRow } from "../heaps/types";
import { FilePreview } from "./file-preview";

type SecondaryView =
  | "graph"
  | "preview"
  | "text-editor"
  | "upload"
  | "scrape-web"
  | "import-drive"
  | "ingest-api"
  | "ingest-mcp";

export function KnowledgeExplorer({ heapId }: WorkspacePaneComponentProps) {
  const [secondaryView, setSecondaryView] = useState<SecondaryView>("graph");
  const [previewFile, setPreviewFile] = useState<FileRow | null>(null);

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

  const renderSecondaryContent = () => {
    switch (secondaryView) {
      case "graph":
        return <KnowledgeGraph heapId={heapId} />;
      case "preview":
        return (
          <FilePreview file={previewFile} onClose={showGraph} heapId={heapId} />
        );
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
