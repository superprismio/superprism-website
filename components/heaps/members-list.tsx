"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Member } from "./types";

export function MembersList({ heapId }: { heapId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heapId}/members`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) setMembers(json.data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [heapId]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          {!loading && members.length === 0 && (
            <div className="text-sm text-muted-foreground">No members</div>
          )}
          {!loading &&
            members.map((m) => (
              <div key={m.membership_id} className="text-sm">
                <span className="font-medium">
                  {m.display_name || m.user_name || m.user_email}
                </span>
                <span className="text-muted-foreground"> — {m.role}</span>
              </div>
            ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invite Collaborators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Invites API route is not present yet. This is a placeholder. Once
            available, this form will call it.
          </div>
          <div className="flex gap-2">
            <Input placeholder="email@example.com" disabled />
            <Button disabled>Invite</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

