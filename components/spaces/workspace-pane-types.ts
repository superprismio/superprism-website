export type WorkspacePaneKey =
  | "spaceFeed"
  | "knowledgeExplorer"
  | "spaceChat"
  | "spaceMembers"
  | "spaceSettings";

export type WorkspacePaneComponentProps = {
  onOpenPaneTwo: (pane: WorkspacePaneKey) => void;
};


