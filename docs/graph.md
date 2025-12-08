# Implementation Plan: Force-Directed Graph for Knowledge Base Files

## Overview

Build a React component using D3.js to visualize files in a knowledge base as a force-directed graph. The visualization will show relationships between files, tags, and users (uploaders).

## Data Model

### Input Data Structure

```typescript
interface File {
  id: string;
  uploader_id: string;
  file_name: string;
  uploaded_at: string; // ISO 8601 date string
  meta: {
    tags: string[];
    folders: string[];
  };
}

// Example:
{
  "id": "d12363b9-0dd0-43d7-864d-2e0424d873fe",
  "uploader_id": "74f87a05-8d30-44b6-900d-8e31cbb740a4",
  "file_name": "markdown-1765135648388.md",
  "uploaded_at": "2025-12-07T19:27:29.825+00:00",
  "meta": {
    "tags": ["general", "how-to"],
    "folders": ["summaries", "meetings"]
  }
}
```

### Graph Data Structure

Transform file data into D3 graph format:

```typescript
interface GraphNode {
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
}

interface GraphLink {
  source: string; // node id
  target: string; // node id
  type: "file-tag" | "file-user";
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
```

## Component Structure

### File Organization

```

hooks/useGraphData.ts    # Hook to transform file data to graph
components/spaces/
    graph-visualization      # Main component
    graph-canvas.tsx         # D3 visualization logic
    graph-controls.tsx       # Filter and interaction controls
lib/graph/
    types.ts                     # TypeScript interfaces
    utils.ts                     # Helper functions (colors, scales, etc.)
```

## Implementation Steps

### Step 1: Data Transformation Hook (`useGraphData.ts`)

Create a hook that transforms file data into graph nodes and links:

```typescript
function useGraphData(files: File[]): GraphData {
  return useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Create file nodes
    files.forEach((file) => {
      nodes.push({
        id: file.id,
        type: "file",
        label: file.file_name,
        uploadedAt: new Date(file.uploaded_at),
        fileName: file.file_name,
        folders: file.meta.folders,
      });

      // Create tag nodes (deduplicated)
      file.meta.tags.forEach((tag) => {
        if (!nodes.find((n) => n.id === `tag-${tag}`)) {
          nodes.push({
            id: `tag-${tag}`,
            type: "tag",
            label: tag,
          });
        }
        // Create file-tag links
        links.push({
          source: file.id,
          target: `tag-${tag}`,
          type: "file-tag",
        });
      });

      // Create user nodes (deduplicated)
      if (!nodes.find((n) => n.id === `user-${file.uploader_id}`)) {
        nodes.push({
          id: `user-${file.uploader_id}`,
          type: "user",
          label: file.uploader_id,
        });
      }
      // Create file-user links
      links.push({
        source: file.id,
        target: `user-${file.uploader_id}`,
        type: "file-user",
      });
    });

    return { nodes, links };
  }, [files]);
}
```

### Step 2: Main Component (`index.tsx`)

```typescript
interface FileGraphVisualizationProps {
  files: File[];
  width?: number;
  height?: number;
}

export function FileGraphVisualization({
  files,
  width = 1200,
  height = 800,
}: FileGraphVisualizationProps) {
  const graphData = useGraphData(files);
  const [filters, setFilters] = useState({
    tags: new Set<string>(),
    users: new Set<string>(),
    dateRange: { start: null, end: null },
  });

  return (
    <div className="graph-container">
      <GraphControls
        files={files}
        filters={filters}
        onFilterChange={setFilters}
      />
      <GraphCanvas
        data={graphData}
        width={width}
        height={height}
        filters={filters}
      />
    </div>
  );
}
```

### Step 3: D3 Visualization Component (`GraphCanvas.tsx`)

This is the core D3 implementation:

```typescript
export function GraphCanvas({ data, width, height, filters }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Create simulation
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance((d) => (d.type === "file-tag" ? 100 : 150))
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create link elements
    const link = svg
      .append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create node elements
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d) => getNodeSize(d))
      .attr("fill", (d) => getNodeColor(d))
      .call(drag(simulation));

    // Add labels
    const labels = svg
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.label)
      .attr("font-size", 10)
      .attr("dx", 15)
      .attr("dy", 4);

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height, filters]);

  return <svg ref={svgRef} width={width} height={height} />;
}
```

### Step 4: Visual Encoding Utilities (`utils.ts`)

```typescript
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

// Color scheme
export function getNodeColor(node: GraphNode): string {
  if (node.type === "file") {
    // Color by recency (gradient from blue to red)
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
export function drag(simulation: d3.Simulation<GraphNode, undefined>) {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}
```

### Step 5: Interaction Controls (`GraphControls.tsx`)

```typescript
export function GraphControls({ files, filters, onFilterChange }) {
  const allTags = useMemo(
    () => Array.from(new Set(files.flatMap((f) => f.meta.tags))),
    [files]
  );

  const allUsers = useMemo(
    () => Array.from(new Set(files.map((f) => f.uploader_id))),
    [files]
  );

  return (
    <div className="controls-panel">
      <div className="filter-section">
        <h3>Filter by Tags</h3>
        {allTags.map((tag) => (
          <label key={tag}>
            <input
              type="checkbox"
              checked={filters.tags.has(tag)}
              onChange={(e) => {
                const newTags = new Set(filters.tags);
                if (e.target.checked) newTags.add(tag);
                else newTags.delete(tag);
                onFilterChange({ ...filters, tags: newTags });
              }}
            />
            {tag}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3>Filter by User</h3>
        {allUsers.map((user) => (
          <label key={user}>
            <input
              type="checkbox"
              checked={filters.users.has(user)}
              onChange={(e) => {
                const newUsers = new Set(filters.users);
                if (e.target.checked) newUsers.add(user);
                else newUsers.delete(user);
                onFilterChange({ ...filters, users: newUsers });
              }}
            />
            {user.slice(0, 8)}...
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3>Date Range</h3>
        {/* Add date range picker */}
      </div>
    </div>
  );
}
```

## Enhancement Features (Phase 2)

### 1. Tooltips on Hover

- Use D3's `.on('mouseover')` and `.on('mouseout')`
- Display file details, tag names, or user info

### 2. Node Click to Pin/Highlight

- Click to fix node position
- Highlight all connected nodes and edges
- Show detailed panel with file metadata

### 3. Search Functionality

- Input field to search by filename
- Highlight matching nodes
- Pan/zoom to selected node

### 4. Time Slider

- Range slider to filter files by upload date
- Animate graph changes as date range changes

### 5. Layout Modes

- Toggle between force-directed and other layouts
- Radial layout with time on angular axis
- Clustered layout by folder

### 6. Zoom and Pan

- Add `d3.zoom()` behavior to SVG
- Reset view button
