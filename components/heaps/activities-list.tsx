"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity } from "./types";

export function ActivitiesList({ heapId }: { heapId: string }) {
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
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No activity yet</div>
        )}
        {!loading &&
          items.map((a) => (
            <div key={a.id} className="text-sm">
              <div className="font-medium">{a.title}</div>
              {a.subtitle && (
                <div className="text-muted-foreground">{a.subtitle}</div>
              )}
              <div className="text-xs text-muted-foreground">
                {a.activity_type} ·{" "}
                {a.created_at
                  ? format(new Date(a.created_at), "MMM d, yyyy 'at' h:mm a")
                  : ""}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
