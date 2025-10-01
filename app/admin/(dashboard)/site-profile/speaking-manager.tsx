"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileSpeakingEngagement } from "@/lib/supabase/types";

import { deleteProfileSpeaking, upsertProfileSpeaking } from "./actions";

type Props = {
  speaking: ProfileSpeakingEngagement[];
  status?: string;
  detail?: string;
};

export function SpeakingManager({ speaking, status, detail }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(
    () => speaking.find((entry) => entry.id === selectedId) ?? null,
    [speaking, selectedId],
  );

  const handleOpen = (id?: string) => {
    setSelectedId(id ?? "");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Speaking engagements</CardTitle>
            <CardDescription>Workshops, conferences, and podcasts that reinforce external credibility.</CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpen()}>
            Add engagement
          </Button>
        </div>
        {status === "speaking-saved" ? (
          <p className="text-sm text-emerald-600">Engagement saved.</p>
        ) : status === "speaking-deleted" ? (
          <p className="text-sm text-emerald-600">Removed engagement {detail ? `“${detail}”` : ""}.</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Talk / Topic</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {speaking.length > 0 ? (
                speaking.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{entry.event}</td>
                    <td className="px-3 py-2 text-muted-foreground">{entry.title ?? "—"}</td>
                    <td className="px-3 py-2">{entry.year ?? "—"}</td>
                    <td className="px-3 py-2 break-all">{entry.link_url ?? "—"}</td>
                    <td className="px-3 py-2">{entry.order_index}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(entry.id)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No engagements logged. Capture high-signal talks and workshops.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal open={open} onClose={handleClose} title={selected ? "Edit engagement" : "Add engagement"}>
        <form id="speaking-form" key={selected?.id ?? "create"} action={upsertProfileSpeaking} className="grid gap-3">
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="speaking-event">
              Event
            </label>
            <Input id="speaking-event" name="event" defaultValue={selected?.event ?? ""} required />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="speaking-title">
                Talk title / topic
              </label>
              <Input
                id="speaking-title"
                name="title"
                defaultValue={selected?.title ?? ""}
                placeholder="SOC automation strategies"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="speaking-year">
                Year
              </label>
              <Input id="speaking-year" name="year" defaultValue={selected?.year ?? ""} placeholder="2024" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="speaking-link">
              Link URL
            </label>
            <Input
              id="speaking-link"
              name="link_url"
              defaultValue={selected?.link_url ?? ""}
              placeholder="https://conference.com/talks/your-session"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="speaking-order">
              Order index
            </label>
            <Input
              id="speaking-order"
              name="order_index"
              type="number"
              defaultValue={selected?.order_index ?? speaking.length}
              min={0}
            />
          </div>
        </form>
        <div className="flex items-center justify-between gap-3 pt-4">
          {selected ? (
            <form
              action={deleteProfileSpeaking}
              onSubmit={(event) => {
                if (!confirm("Delete this engagement?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="event" value={selected.event} />
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form="speaking-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
