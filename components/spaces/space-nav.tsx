"use client";

import { cn } from "@/lib/utils";
import {
  Box,
  Globe,
  Library,
  Pyramid,
  Settings,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { WorkspacePaneKey } from "./workspace-pane-types";

type SpaceNavItem = {
  key: WorkspacePaneKey;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const NAV_ITEMS: SpaceNavItem[] = [
  {
    key: "spaceFeed",
    label: "Space Feed",
    icon: Pyramid,
    badge: "3",
  },
  {
    key: "knowledgeExplorer",
    label: "Knowledge Explorer",
    icon: Library,
  },
  {
    key: "spaceProjects",
    label: "Space Projects",
    icon: Box,
  },
  {
    key: "spaceMembers",
    label: "Space Members",
    icon: UserPlus,
  },
  {
    key: "spacePublish",
    label: "Publish",
    icon: Globe,
  },
  {
    key: "spaceSettings",
    label: "Space Settings",
    icon: Settings,
  },
];

type SpaceNavProps = {
  activePrimary: WorkspacePaneKey;
  activeSecondary: WorkspacePaneKey | null;
  onSelect: (pane: WorkspacePaneKey) => void;
};

export function SpaceNav({
  activePrimary,
  activeSecondary,
  onSelect,
}: SpaceNavProps) {
  return (
    <nav className="border-r p-2">
      <ul className="flex flex-row items-center justify-between gap-2 md:flex-col md:items-stretch">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === activePrimary || item.key === activeSecondary;

          return (
            <li key={item.key} className="flex flex-1 md:flex-initial">
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                className={cn(
                  "flex w-full flex-col items-center justify-center rounded-md px-2 py-3 text-xs font-medium transition-colors md:px-3 md:py-4",
                  isActive
                    ? "text-foreground"
                    : "text-primary hover:text-foreground",
                  item.key === "spaceFeed" ? "mb-8" : "",
                  item.key === "spaceSettings" ? "mt-8" : ""
                )}
                aria-pressed={isActive}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.badge ? (
                  <span className="mt-2 inline-flex items-center bg-primary px-2 py-[2px] text-[10px] font-semibold text-background md:mt-3">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
