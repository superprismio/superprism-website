"use client";

import { format } from "date-fns";
import { useSpaceActivities } from "@/hooks/useSpaceActivities";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SpaceFeed({ heapId }: WorkspacePaneComponentProps) {
  const { activities, isLoading, pagination, nextPage, prevPage } =
    useSpaceActivities(heapId);

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between flex-shrink-0">
        <h3 className="font-semibold text-foreground">Feed</h3>
      </header>
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-6 px-3 py-4">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          {!isLoading && activities.length === 0 && (
            <div className="text-sm text-muted-foreground">No activity yet</div>
          )}
          {!isLoading &&
            activities.map((a) => (
              <div key={a.id} className="text-sm">
                <div className="text-sm">
                  {a.created_at
                    ? format(new Date(a.created_at), "MMM d, yyyy 'at' h:mm a")
                    : ""}{" "}
                  - {a.activity_type}
                </div>
                <div className="text-base text-muted-foreground">
                  {" "}
                  {a.title}{" "}
                </div>
                {a.subtitle && (
                  <div className="text-muted-foreground">{a.subtitle}</div>
                )}
                <div className="text-xs text-muted-foreground"></div>
              </div>
            ))}
          {pagination && pagination.totalPages > 1 && (
            <div className="pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        prevPage();
                      }}
                      className={
                        !pagination.hasPrev
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      label="Newer"
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <div className="text-sm text-muted-foreground px-4">
                      {pagination.page} of {pagination.totalPages}
                    </div>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        nextPage();
                      }}
                      className={
                        !pagination.hasNext
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      label="Older"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
