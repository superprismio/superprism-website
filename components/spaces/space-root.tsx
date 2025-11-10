"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pyramid } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateSpaceDialog } from "./create-space-dialog";
import { Workspace } from "./workspace";
import { Space } from "./types";
import { useUserHeaps, USER_HEAPS_QUERY_KEY } from "./hooks";

export function SpaceRoot() {
  const queryClient = useQueryClient();
  const { data: spaces = [], isPending, error } = useUserHeaps();
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  useEffect(() => {
    if (spaces.length === 0) {
      setActiveSpaceId(null);
      return;
    }

    setActiveSpaceId((current) => current ?? spaces[0]?.id ?? null);
  }, [spaces]);

  const handleCreatedSpace = useCallback(
    (space: Space) => {
      queryClient.setQueryData<Space[] | undefined>(
        USER_HEAPS_QUERY_KEY,
        (prev) => {
          if (!prev) return [space];
          if (prev.some((item) => item.id === space.id)) return prev;
          return [space, ...prev];
        }
      );
      setActiveSpaceId(space.id);
    },
    [queryClient]
  );

  const isLoading = isPending;
  const errorMessage = error?.message ?? null;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-3 py-4">
        <div className="flex items-center gap-3 min-w-[220px]">
          <Select
            value={activeSpaceId ?? ""}
            onValueChange={setActiveSpaceId}
            disabled={isLoading || spaces.length === 0}
          >
            <SelectTrigger className="w-56 border-none focus:ring-none focus:ring-0 text-lg">
              <SelectValue
                placeholder={
                  isLoading
                    ? "Loading spaces..."
                    : spaces.length === 0
                    ? "No spaces yet"
                    : "Select a space"
                }
              />
            </SelectTrigger>
            <SelectContent className="text-white bg-background">
              {spaces.map((space) => (
                <SelectItem key={space.id} value={space.id} className="text-lg">
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CreateSpaceDialog
          onCreated={(space) => {
            handleCreatedSpace(space);
          }}
          trigger={
            <Button
              size="sm"
              className="flex items-center gap-2 text-primary"
              variant="ghost"
            >
              <Plus className="h-4 w-4" />
              <Pyramid className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {errorMessage ? (
        <div className="px-6 py-10 rounded border border-destructive/50 text-destructive text-sm">
          {errorMessage}
        </div>
      ) : (
        <Workspace
          spaceId={activeSpaceId}
          isLoadingList={isLoading}
          emptyStateAction={
            <CreateSpaceDialog
              onCreated={(space) => {
                handleCreatedSpace(space);
              }}
              trigger={<Button>Create a space</Button>}
            />
          }
        />
      )}
    </div>
  );
}
