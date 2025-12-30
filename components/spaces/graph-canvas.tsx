"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { GraphData } from "@/lib/space-graph";
import { getNodeSize, getNodeColor, drag } from "@/lib/space-graph";

interface GraphCanvasProps {
  data: GraphData;
  width?: number;
  height?: number;
  selectedNodeId?: string | null;
  onNodeClick?: (nodeId: string | null) => void;
}

export function GraphCanvas({
  data,
  width: propWidth,
  height: propHeight,
  selectedNodeId,
  onNodeClick,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Measure container size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: propWidth || rect.width || 800,
          height: propHeight || rect.height || 600,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [propWidth, propHeight]);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Set SVG dimensions
    svg.attr("width", width).attr("height", height);

    // Convert links to D3 format (string IDs to node references)
    const links = data.links
      .map((link) => {
        const sourceNode =
          typeof link.source === "string"
            ? data.nodes.find((n) => n.id === link.source)
            : link.source;
        const targetNode =
          typeof link.target === "string"
            ? data.nodes.find((n) => n.id === link.target)
            : link.target;

        // Only include links where both nodes exist
        if (
          sourceNode &&
          targetNode &&
          typeof sourceNode === "object" &&
          typeof targetNode === "object"
        ) {
          return {
            source: sourceNode,
            target: targetNode,
            type: link.type,
          };
        }
        return null;
      })
      .filter((link): link is NonNullable<typeof link> => link !== null);

    // Pin selected node by fixing its position
    if (selectedNodeId) {
      const selectedNode = data.nodes.find((n) => n.id === selectedNodeId);
      if (
        selectedNode &&
        selectedNode.x !== undefined &&
        selectedNode.y !== undefined
      ) {
        // Only pin if not already pinned (avoid overriding user drag)
        if (selectedNode.fx === null && selectedNode.fy === null) {
          selectedNode.fx = selectedNode.x;
          selectedNode.fy = selectedNode.y;
        }
      }
    } else {
      // Unpin all nodes when nothing is selected (except manually dragged ones)
      // We'll let the drag handler manage unpinning for manually dragged nodes
    }

    // Get connected node IDs for highlighting
    const getConnectedNodeIds = (nodeId: string): Set<string> => {
      const connected = new Set<string>([nodeId]);
      links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        if (sourceId === nodeId) connected.add(targetId);
        if (targetId === nodeId) connected.add(sourceId);
      });
      return connected;
    };

    const connectedNodeIds = selectedNodeId
      ? getConnectedNodeIds(selectedNodeId)
      : new Set<string>();

    // Pin selected node by fixing its position when first selected
    // We'll set fx/fy in the click handler instead to avoid resetting on every render

    // Create simulation
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => (typeof d === "object" && d.id ? d.id : d))
          .distance((d: any) => (d.type === "file-tag" ? 100 : 150))
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create link elements
    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, (typeof links)[0]>("line")
      .data(links)
      .join("line")
      .attr("stroke", (d: any) => {
        const sourceId = typeof d.source === "object" ? d.source.id : d.source;
        const targetId = typeof d.target === "object" ? d.target.id : d.target;
        const isHighlighted =
          selectedNodeId &&
          (sourceId === selectedNodeId || targetId === selectedNodeId);
        return isHighlighted ? "#3b82f6" : "#999";
      })
      .attr("stroke-opacity", (d: any) => {
        const sourceId = typeof d.source === "object" ? d.source.id : d.source;
        const targetId = typeof d.target === "object" ? d.target.id : d.target;
        const isHighlighted =
          selectedNodeId &&
          (sourceId === selectedNodeId || targetId === selectedNodeId);
        return isHighlighted ? 1 : 0.6;
      })
      .attr("stroke-width", (d: any) => {
        const sourceId = typeof d.source === "object" ? d.source.id : d.source;
        const targetId = typeof d.target === "object" ? d.target.id : d.target;
        const isHighlighted =
          selectedNodeId &&
          (sourceId === selectedNodeId || targetId === selectedNodeId);
        return isHighlighted ? 3 : 2;
      });

    // Create node elements
    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGCircleElement, (typeof data.nodes)[0]>("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d) => getNodeSize(d))
      .attr("fill", (d) => {
        const isSelected = d.id === selectedNodeId;
        const isConnected = connectedNodeIds.has(d.id);
        if (isSelected) {
          return "#3b82f6";
        }
        if (isConnected && selectedNodeId) {
          return getNodeColor(d);
        }
        return getNodeColor(d);
      })
      .attr("opacity", (d) => {
        if (!selectedNodeId) return 1;
        return connectedNodeIds.has(d.id) ? 1 : 0.3;
      })
      .attr("stroke", (d) => {
        const isSelected = d.id === selectedNodeId;
        return isSelected ? "#1d4ed8" : "none";
      })
      .attr("stroke-width", (d) => {
        const isSelected = d.id === selectedNodeId;
        return isSelected ? 3 : 0;
      })
      .style("cursor", "pointer")
      .on("click", function (event, d: any) {
        event.stopPropagation();
        if (onNodeClick) {
          // Toggle: if already selected, deselect
          if (d.id === selectedNodeId) {
            // Deselect: unpin the node
            d.fx = null;
            d.fy = null;
            onNodeClick(null);
          } else {
            // Select: pin the node at its current position
            if (d.x !== undefined && d.y !== undefined) {
              d.fx = d.x;
              d.fy = d.y;
            }
            onNodeClick(d.id);
          }
        }
      })
      .call(drag(simulation));

    // Add labels
    const labels = svg
      .append("g")
      .attr("class", "labels")
      .selectAll<SVGTextElement, (typeof data.nodes)[0]>("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.label)
      .attr("font-size", 10)
      .attr("dx", 15)
      .attr("dy", 4)
      .attr("fill", "currentColor")
      .attr("opacity", (d) => {
        if (!selectedNodeId) return 1;
        return connectedNodeIds.has(d.id) ? 1 : 0.3;
      });

    // Click on background to deselect
    svg.on("click", function (event) {
      if (event.target === this && onNodeClick) {
        onNodeClick(null);
      }
    });

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => {
          const source = typeof d.source === "object" ? d.source : null;
          return source?.x || 0;
        })
        .attr("y1", (d: any) => {
          const source = typeof d.source === "object" ? d.source : null;
          return source?.y || 0;
        })
        .attr("x2", (d: any) => {
          const target = typeof d.target === "object" ? d.target : null;
          return target?.x || 0;
        })
        .attr("y2", (d: any) => {
          const target = typeof d.target === "object" ? d.target : null;
          return target?.y || 0;
        });

      node.attr("cx", (d: any) => d.x || 0).attr("cy", (d: any) => d.y || 0);

      labels.attr("x", (d: any) => d.x || 0).attr("y", (d: any) => d.y || 0);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, selectedNodeId, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
