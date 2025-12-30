"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useSpaceFiles } from "@/hooks/useSpaceFiles";
import { useGraphData } from "@/hooks/useGraphData";
import { GraphCanvas } from "./graph-canvas";
import { getNodeTypeColor } from "@/lib/space-graph";
import type { GraphNode } from "@/lib/space-graph";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FileRow } from "./types";

interface KnowledgeGraphProps {
  heapId: string;
}

function GraphLegend() {
  return (
    <div className="absolute top-2 left-2 bg-background border border-border rounded-lg p-3 shadow-lg z-10">
      <h5 className="text-xs font-semibold mb-2 text-foreground">Node Types</h5>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: getNodeTypeColor("tag") }}
          />
          <span className="text-xs text-foreground">Tag</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: getNodeTypeColor("user") }}
          />
          <span className="text-xs text-foreground">User</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: getNodeTypeColor("file") }}
          />
          <span className="text-xs text-foreground">File</span>
        </div>
        <div>
          <p className="text-[8px] text-muted-foreground leading-none">
            File colors show upload date:
          </p>
          <p className="text-[8px] text-muted-foreground leading-none">
            newer = yellow/green
          </p>
          <p className="text-[8px] text-muted-foreground leading-none">
            older = blue/purple
          </p>
        </div>
      </div>
    </div>
  );
}

function NodeMetadataPanel({
  node,
  file,
  onClose,
}: {
  node: GraphNode | null;
  file: FileRow | null;
  onClose: () => void;
}) {
  if (!node) return null;

  return (
    <div className="absolute left-2 top-2 bottom-2 w-80 bg-background border border-border rounded-lg shadow-lg z-20 flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h5 className="text-sm font-semibold text-foreground">Node Details</h5>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Type
          </div>
          <Badge variant="outline" className="capitalize">
            {node.type}
          </Badge>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Label
          </div>
          <div className="text-sm text-foreground">{node.label}</div>
        </div>

        {node.type === "file" && file && (
          <>
            {file.uploaded_at && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Uploaded At
                </div>
                <div className="text-sm text-foreground">
                  {format(
                    new Date(file.uploaded_at),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </div>
              </div>
            )}

            {file.file_name && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  File Name
                </div>
                <div className="text-sm text-foreground break-words">
                  {file.file_name}
                </div>
              </div>
            )}

            {file.status && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Status
                </div>
                <div className="text-sm text-foreground">{file.status}</div>
              </div>
            )}

            {file.source_type && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Source Type
                </div>
                <div className="text-sm text-foreground">
                  {file.source_type}
                </div>
              </div>
            )}

            {file.meta?.tags && file.meta.tags.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {file.meta.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {file.meta?.folders && file.meta.folders.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Folders
                </div>
                <div className="flex flex-wrap gap-1">
                  {file.meta.folders.map((folder, idx) => (
                    <Badge key={idx} variant="outline">
                      {folder}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {file.meta?.summary_short && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Summary
                </div>
                <div className="text-sm text-foreground">
                  {file.meta.summary_short}
                </div>
              </div>
            )}

            {file.uploader_id && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Uploader ID
                </div>
                <div className="text-sm text-foreground font-mono text-xs break-all">
                  {file.uploader_id}
                </div>
              </div>
            )}
          </>
        )}

        {node.type === "tag" && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Tag Name
            </div>
            <div className="text-sm text-foreground">{node.label}</div>
          </div>
        )}

        {node.type === "user" && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              User ID
            </div>
            <div className="text-sm text-foreground font-mono text-xs break-all">
              {node.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function KnowledgeGraph({ heapId }: KnowledgeGraphProps) {
  const { files, isLoading, isError } = useSpaceFiles(heapId);
  const graphData = useGraphData(files);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graphData.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData.nodes]);

  const selectedFile = useMemo(() => {
    if (!selectedNode || selectedNode.type !== "file") return null;
    return files.find((f) => f.id === selectedNode.id) || null;
  }, [selectedNode, files]);

  if (isLoading) {
    return (
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center justify-between border-b border-b-border px-3 py-4">
          <h4 className="text-sm font-medium">Knowledge Graph</h4>
        </div>
        <div className="flex items-center justify-center h-full">
          <p>Loading graph data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center justify-between border-b border-b-border px-3 py-4">
          <h4 className="text-sm font-medium">Knowledge Graph</h4>
        </div>
        <div className="flex items-center justify-center h-full">
          <p>Error loading graph data</p>
        </div>
      </div>
    );
  }

  if (!graphData.nodes.length) {
    return (
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center justify-between border-b border-b-border px-3 py-4">
          <h4 className="text-sm font-medium">Knowledge Graph</h4>
        </div>
        <div className="flex items-center justify-center h-full">
          <p>No data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm text-muted-foreground h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-b-border px-3 py-4">
        <h4 className="text-sm font-medium">Knowledge Graph</h4>
      </div>
      <div className="flex-1 min-h-0 relative">
        <GraphCanvas
          data={graphData}
          selectedNodeId={selectedNodeId}
          onNodeClick={setSelectedNodeId}
        />
        <GraphLegend />
        <NodeMetadataPanel
          node={selectedNode}
          file={selectedFile}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
