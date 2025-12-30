"use client";

import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { useUserHeaps, USER_HEAPS_QUERY_KEY } from "../../hooks/useSpaces";

type SpaceRootProps = {
  heapId?: string;
};

export function SpaceRoot({ heapId }: SpaceRootProps) {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { data: spaces = [], isPending, error } = useUserHeaps();
  
  // Get heapId from props (server) or params (client navigation)
  const activeSpaceId = heapId ?? (params?.heapId as string | undefined) ?? null;

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
      router.push(`/dashboard/${space.id}`);
    },
    [queryClient, router]
  );

  const handleSpaceChange = useCallback(
    (newSpaceId: string) => {
      router.push(`/dashboard/${newSpaceId}`);
    },
    [router]
  );

  const isLoading = isPending;
  const errorMessage = error?.message ?? null;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-3 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-[220px]">
          <Select
            value={activeSpaceId ?? ""}
            onValueChange={handleSpaceChange}
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
        <div className="flex-1 min-h-0">
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
        </div>
      )}
    </div>
  );
}
