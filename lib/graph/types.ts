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
