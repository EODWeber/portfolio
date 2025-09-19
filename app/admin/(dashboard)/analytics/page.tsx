import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientCopyButton } from "./client-copy-button";
import { fetchAllContactRequests, fetchEventSummary, fetchRecentEvents } from "@/lib/admin/queries";

export default async function AnalyticsPage() {
  const [events, contactRequests, recent] = await Promise.all([
    fetchEventSummary(),
    fetchAllContactRequests(),
    fetchRecentEvents(20),
  ]);

  const contactStats = {
    total: contactRequests.length,
    new: contactRequests.filter((req) => req.status === "new").length,
    replied: contactRequests.filter((req) => req.status === "replied").length,
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Engagement snapshots derived from Supabase events and contact requests.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact requests</CardTitle>
            <CardDescription>Pipeline of inbound opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-foreground text-xl font-semibold">{contactStats.total}</p>
            <p className="text-muted-foreground">{contactStats.new} awaiting review · {contactStats.replied} replied</p>
            <Link href="/admin/contact-requests" className="text-primary text-xs hover:underline">
              Manage inbox →
            </Link>
          </CardContent>
        </Card>
        {events.map((event) => (
          <Card key={event.type}>
            <CardHeader>
              <CardTitle className="capitalize">{event.type.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent className="text-foreground text-2xl font-semibold">{event.count}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Latest 20 events captured from the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-96 overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b">
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((ev) => (
                  <tr key={ev.id} className="border-b last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{ev.type}</td>
                    <td className="px-3 py-2">
                      <pre className="max-w-[40ch] truncate whitespace-pre-wrap break-words text-xs text-muted-foreground">
                        {typeof ev.metadata === "string"
                          ? ev.metadata
                          : JSON.stringify(ev.metadata)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ClientCopyButton
            className="text-primary text-xs hover:underline"
            text={JSON.stringify(recent, null, 2)}
          >
            Copy JSON export
          </ClientCopyButton>
        </CardContent>
      </Card>
    </div>
  );
}
