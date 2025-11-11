export type WorkspacePaneKey =
  | "spaceFeed"
  | "knowledgeExplorer"
  | "spaceChat"
  | "spaceProjects"
  | "spaceMembers"
  | "spacePublish"
  | "spaceSettings";

export type WorkspacePaneComponentProps = {
  onOpenPaneTwo?: (pane: WorkspacePaneKey) => void;
  heapId: string;
};
