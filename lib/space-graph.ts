import * as d3 from "d3";

export interface GraphNode {
  id: string;
  type: "file" | "tag" | "user";
  label: string;
  // For file nodes:
  uploadedAt?: Date;
  fileName?: string;
  folders?: string[];
  // For calculating visuals:
  size?: number;
  color?: string;
  // D3 simulation properties (added by D3)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode; // node id or node object
  target: string | GraphNode; // node id or node object
  type: "file-tag" | "file-user";
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Node size based on type and recency
export function getNodeSize(node: GraphNode): number {
  if (node.type === "file") {
    // Larger for more recent files
    const daysSinceUpload = node.uploadedAt
      ? (Date.now() - node.uploadedAt.getTime()) / (1000 * 60 * 60 * 24)
      : 365;
    return Math.max(5, 20 - daysSinceUpload / 30);
  }
  if (node.type === "tag") return 15;
  if (node.type === "user") return 12;
  return 10;
}

// Base colors for each node type (for legend)
export function getNodeTypeColor(type: "file" | "tag" | "user"): string {
  if (type === "file") return "#4A90E2";
  if (type === "tag") return "#F39C12";
  if (type === "user") return "#9B59B6";
  return "#95A5A6";
}

// Color scheme
export function getNodeColor(node: GraphNode): string {
  if (node.type === "file") {
    // Color by recency (gradient using viridis)
    if (node.uploadedAt) {
      const colorScale = d3
        .scaleSequential(d3.interpolateViridis)
        .domain([Date.now() - 365 * 24 * 60 * 60 * 1000, Date.now()]);
      return colorScale(node.uploadedAt.getTime());
    }
    return "#4A90E2";
  }
  if (node.type === "tag") return "#F39C12";
  if (node.type === "user") return "#9B59B6";
  return "#95A5A6";
}

// Drag behavior
export function drag(
  simulation: d3.Simulation<GraphNode, undefined>
): d3.DragBehavior<SVGCircleElement, GraphNode, GraphNode> {
  function dragstarted(
    event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>
  ) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(
    event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>
  ) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(
    event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>
  ) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag<SVGCircleElement, GraphNode, GraphNode>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}
