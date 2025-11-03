"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilesTab } from "./files-tab";
import { ChatTab } from "./chat-tab";
import { SettingsTab } from "./settings-tab";
import { ActivitiesList } from "./activities-list";
import { MembersList } from "./members-list";
import type { Heap } from "./types";

export function HeapDetail({ heapId }: { heapId: string }) {
  const [heap, setHeap] = useState<Heap | null>(null);
  const [heapLoading, setHeapLoading] = useState(false);
  const [chatAttachedFileIds, setChatAttachedFileIds] = useState<string[]>([]);
  const [md, setMd] = useState<string>("");

  useEffect(() => {
    if (!heapId) {
      setHeap(null);
      return;
    }
    let mounted = true;
    (async () => {
      setHeapLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heapId}`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) setHeap(json.data);
      } finally {
        if (mounted) setHeapLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [heapId]);

  const handleAttachFileToChat = (fileId: string) => {
    setChatAttachedFileIds((ids) => Array.from(new Set([...ids, fileId])));
  };

  const handleExportToEditor = (content: string) => {
    setMd((prev) => (prev ? `${prev}\n\n${content}` : content));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">
            {heapLoading ? "Loading..." : heap?.name}
          </div>
        </div>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="activities">Activity</TabsTrigger>
          <TabsTrigger value="files">The Pile</TabsTrigger>
          <TabsTrigger value="chat">Projects</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <FilesTab
            heapId={heapId}
            onAttachFileToChat={handleAttachFileToChat}
            md={md}
            onMdChange={setMd}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <ChatTab
            heapId={heapId}
            attachedFileIds={chatAttachedFileIds}
            onAttachedFileIdsChange={setChatAttachedFileIds}
            onExportToEditor={handleExportToEditor}
          />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesList heapId={heapId} />
        </TabsContent>

        <TabsContent value="members">
          <MembersList heapId={heapId} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab heap={heap} onHeapChange={setHeap} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
