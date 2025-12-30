"use client";

import { useMemo } from "react";
import type { GraphData, GraphNode, GraphLink } from "@/lib/space-graph";
import { FileRow } from "@/components/spaces/types";

export function useGraphData(files: FileRow[]): GraphData {
  return useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const tagNodeIds = new Set<string>();
    const userNodeIds = new Set<string>();

    // Create file nodes and their relationships
    files.forEach((file) => {
      // Create file node
      nodes.push({
        id: file.id,
        type: "file",
        label: file.file_name || file.id,
        uploadedAt: file.uploaded_at ? new Date(file.uploaded_at) : undefined,
        fileName: file.file_name || undefined,
        folders: file.meta?.folders || [],
      });

      // Create tag nodes (deduplicated) and file-tag links
      const tags = file.meta?.tags || [];
      tags.forEach((tag) => {
        if (typeof tag !== "string" || !tag.trim()) return;

        const tagId = `tag-${tag}`;
        if (!tagNodeIds.has(tagId)) {
          nodes.push({
            id: tagId,
            type: "tag",
            label: tag,
          });
          tagNodeIds.add(tagId);
        }
        // Create file-tag links
        links.push({
          source: file.id,
          target: tagId,
          type: "file-tag",
        });
      });

      const uploaderId = file.uploader_id;
      if (uploaderId) {
        const userId = `user-${uploaderId}`;
        if (!userNodeIds.has(userId)) {
          nodes.push({
            id: userId,
            type: "user",
            label: uploaderId,
          });
          userNodeIds.add(userId);
        }
        // Create file-user links
        links.push({
          source: file.id,
          target: userId,
          type: "file-user",
        });
      }
    });

    return { nodes, links };
  }, [files]);
}
