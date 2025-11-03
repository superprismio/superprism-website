"use client";

import { HeapsSidebar } from "@/components/heaps/heaps-sidebar";

export default function HeapsPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full">
      <HeapsSidebar selectedHeapId="" />
      <main className="flex-1 p-4 overflow-auto">
        <div className="text-muted-foreground">Select a heap to begin.</div>
      </main>
    </div>
  );
}

