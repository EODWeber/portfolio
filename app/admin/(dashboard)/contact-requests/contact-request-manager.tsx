"use client";

import { Fragment, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContactRequest } from "@/lib/supabase/types";

import { deleteContactRequest, updateContactRequestStatus } from "./actions";

const STATUSES: Array<{ label: string; value: ContactRequest["status"] }> = [
  { label: "New", value: "new" },
  { label: "In review", value: "in-review" },
  { label: "Replied", value: "replied" },
  { label: "Archived", value: "archived" },
];

export function ContactRequestsManager({
  requests,
  status,
}: {
  requests: ContactRequest[];
  status?: string;
}) {
  const [expandedId, setExpandedId] = useState<string>("");
  const [filter, setFilter] = useState<ContactRequest["status"] | "all">("all");
  type PageSize = 10 | 20 | 50 | "all";
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const filtered = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  );

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Contact inbox</h1>
            <p className="text-muted-foreground text-sm">
              Review and triage inbound requests from the contact form.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-medium" htmlFor="status-filter">
              Filter
            </label>
            <select
              id="status-filter"
              value={filter}
              onChange={(e) => {
                setExpandedId("");
                setFilter(e.target.value as ContactRequest["status"] | "all");
              }}
              className="border-input bg-background focus:ring-ring w-40 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="all">All</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium" htmlFor="page-size">
              Show
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) =>
                setPageSize(e.target.value === "all" ? "all" : (Number(e.target.value) as PageSize))
              }
              className="border-input bg-background focus:ring-ring w-28 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
              } catch (error) {
                console.error("Unable to copy contact export", error);
              }
            }}
          >
            Copy JSON export
          </Button>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Contact request updated.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Contact request deleted.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Filter by status; archived items are hidden unless filtered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr className="border-b">
                  <th className="px-3 py-2">Received</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, pageSize === "all" ? filtered.length : pageSize).map((r) => (
                  <Fragment key={r.id}>
                    <tr className="border-b last:border-0">
                      <td className="whitespace-nowrap px-3 py-2">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">
                        <button
                          className="hover:underline"
                          onClick={() => copyToClipboard(r.email)}
                        >
                          {r.email}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        {r.company ? (
                          <button
                            className="hover:underline"
                            onClick={() => copyToClipboard(r.company || "")}
                          >
                            {r.company}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 capitalize">{r.status.replace("-", " ")}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="text-primary hover:underline"
                            onClick={() => setExpandedId(expandedId === r.id ? "" : r.id)}
                          >
                            {expandedId === r.id ? "Hide" : "View"}
                          </button>
                          <form action={updateContactRequestStatus} className="inline-flex">
                            <input type="hidden" name="id" value={r.id} />
                            <select
                              name="status"
                              defaultValue={r.status}
                              className="bg-background mr-2 rounded-md border px-2 py-1 text-xs"
                            >
                              {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              className="py-1 text-xs"
                              type="submit"
                              variant="outline"
                            >
                              Update
                            </Button>
                          </form>
                          <form action={deleteContactRequest} className="inline-flex">
                            <input type="hidden" name="id" value={r.id} />
                            <Button
                              size="sm"
                              className="py-1 text-xs"
                              variant="destructive"
                              type="submit"
                            >
                              Delete
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                    {expandedId === r.id ? (
                      <tr className="bg-muted/20 border-b last:border-0">
                        <td colSpan={6} className="px-3 py-3">
                          <div className="text-muted-foreground whitespace-pre-wrap text-sm leading-6">
                            {r.message}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// CSV export removed; JSON export is available via the Copy button
