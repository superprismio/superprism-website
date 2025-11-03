"use client";

import { useParams } from "next/navigation";
import { HeapsSidebar } from "@/components/heaps/heaps-sidebar";
import { HeapDetail } from "@/components/heaps/heap-detail";

export default function HeapDetailPage() {
  const params = useParams();
  const heapId = params.heapId as string;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full">
      <HeapsSidebar selectedHeapId={heapId} />
      <main className="flex-1 p-4 overflow-auto">
        {heapId && <HeapDetail heapId={heapId} />}
      </main>
    </div>
  );
}

