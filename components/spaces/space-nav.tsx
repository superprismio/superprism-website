"use client";

import { cn } from "@/lib/utils";
import {
  Box,
  CircleUserRound,
  // Globe,
  Library,
  MessageCircle,
  Pyramid,
  Settings,
  // UserPlus,
  type LucideIcon,
} from "lucide-react";
import { WorkspacePaneKey } from "./workspace-pane-types";
// import { AuthButton } from "../auth/auth-button";
import { LogoutButton } from "../auth/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type SpaceNavItem = {
  key: WorkspacePaneKey;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const NAV_ITEMS: SpaceNavItem[] = [
  {
    key: "spaceFeed",
    label: "Feed",
    icon: Pyramid,
    badge: "3",
  },
  {
    key: "knowledgeExplorer",
    label: "Knowledge",
    icon: Library,
  },
  {
    key: "spaceProjects",
    label: "Projects",
    icon: Box,
  },
  // {
  //   key: "spaceMembers",
  //   label: "Space Members",
  //   icon: UserPlus,
  // },
  // {
  //   key: "spacePublish",
  //   label: "Publish",
  //   icon: Globe,
  // },
  {
    key: "spaceSettings",
    label: "Settings",
    icon: Settings,
  },
];

type SpaceNavProps = {
  activePrimary: WorkspacePaneKey;
  activeSecondary: WorkspacePaneKey | null;
  onSelect: (pane: WorkspacePaneKey) => void;
  onOpenChatDialog?: () => void;
  isMobile?: boolean;
};

export function SpaceNav({
  activePrimary,
  activeSecondary,
  onSelect,
  onOpenChatDialog,
  isMobile = false,
}: SpaceNavProps) {
  return (
    <nav className="flex h-auto flex-col border-b p-2 md:h-full md:border-b-0 md:border-r">
      <div className="flex w-full flex-row items-start justify-between md:flex-1 md:flex-col md:items-center md:justify-between">
        <TooltipProvider delayDuration={200}>
          <ul className="flex flex-row items-start justify-between gap-1 md:flex-1 md:flex-initial md:flex-col md:items-stretch">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.key === activePrimary || item.key === activeSecondary;

              return (
                <li key={item.key} className="flex flex-1 md:flex-initial">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelect(item.key)}
                        className={cn(
                          "flex w-full flex-col items-center justify-center rounded-md px-2 py-2 text-xs font-medium transition-colors md:px-3 md:py-4",
                          isActive
                            ? "text-foreground"
                            : "text-primary hover:text-foreground",
                          item.key === "spaceFeed" ? "md:mb-8" : "",
                          item.key === "spaceSettings" ? "md:mt-8" : ""
                        )}
                        aria-pressed={isActive}
                        aria-label={item.label}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="mt-2 text-[11px] text-foreground md:hidden">
                          {item.label}
                        </span>
                        {/* {item.badge ? (
                          <span className="mt-2 rounded-[4px] inline-flex items-center bg-primary px-2 py-[2px] text-[10px] font-semibold text-background md:mt-3">
                            {item.badge}
                          </span>
                        ) : null} */}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="hidden md:block border-border bg-background text-foreground"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
            {isMobile && onOpenChatDialog && (
              <li className="flex flex-1 md:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onOpenChatDialog}
                      className={cn(
                        "flex w-full flex-col items-center justify-center rounded-md px-2 py-2 text-xs font-medium transition-colors",
                        "text-primary hover:text-foreground"
                      )}
                      aria-label="Open chat"
                    >
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                      <span className="mt-2 text-[11px] text-foreground">
                        Chat
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="hidden md:block border-border bg-background text-foreground"
                  >
                    Chat
                  </TooltipContent>
                </Tooltip>
              </li>
            )}
          </ul>
          <div className="ml-2 flex justify-center md:ml-0 md:mt-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open account menu"
                  size="icon"
                  variant="ghost"
                  className="h-auto w-auto flex-col px-2 pt-2 pb-0 md:h-9 md:w-9 md:px-0 md:py-0"
                >
                  <CircleUserRound />
                  <span className="mt-0 text-[11px] text-foreground md:hidden">
                    Profile
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background">
                <DropdownMenuItem asChild disabled={true}>
                  <p>User settings</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-1 pb-1">
                  <LogoutButton />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      </div>
    </nav>
  );
}
