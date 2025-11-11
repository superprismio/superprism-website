"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import type { Activity } from "./types";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceFeed({ heapId }: WorkspacePaneComponentProps) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heapId}/activities`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) setItems(json.data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [heapId]);

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Feed</h3>
        <div className="text-foreground">Filter</div>
      </header>
      <div className="space-y-6 px-3 py-4">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No activity yet</div>
        )}
        {!loading &&
          items.map((a) => (
            <div key={a.id} className="text-sm">
              <div className="text-sm">{a.activity_type}</div>
              <div className="text-base text-muted-foreground"> {a.title} </div>
              {a.subtitle && (
                <div className="text-muted-foreground">{a.subtitle}</div>
              )}
              <div className="text-xs text-muted-foreground">
                {a.created_at
                  ? format(new Date(a.created_at), "MMM d, yyyy 'at' h:mm a")
                  : ""}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
