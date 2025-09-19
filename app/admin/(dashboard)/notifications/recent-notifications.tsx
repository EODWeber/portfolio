"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NotificationLog } from "@/lib/supabase/types";

export function RecentNotifications({ initial }: { initial: NotificationLog[] }) {
  const [log, setLog] = useState<NotificationLog[]>(initial);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      const res = await fetch("/api/admin/notifications-log");
      if (active && res.ok) {
        const data = (await res.json()) as NotificationLog[];
        setLog(data);
      }
    };
    const id = setInterval(tick, 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Recent notifications</CardTitle>
        <CardDescription>Last 20 messages sent or errors encountered.</CardDescription>
      </CardHeader>
      <CardContent>
        {log.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notifications yet.</p>
        ) : (
          <div className="max-h-96 overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b">
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Channel</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {log.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{item.channel}</td>
                    <td className="px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{item.detail ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
