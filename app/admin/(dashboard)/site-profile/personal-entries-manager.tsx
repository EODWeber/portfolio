"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfilePersonalEntry } from "@/lib/supabase/types";

import { deleteProfilePersonalEntry, upsertProfilePersonalEntry } from "./actions";

type Props = {
  entries: ProfilePersonalEntry[];
  status?: string;
  detail?: string;
};

export function PersonalEntriesManager({ entries, status, detail }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? null,
    [entries, selectedId],
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
            <CardTitle>Beyond security</CardTitle>
            <CardDescription>
              Personal interests, languages, and collaboration notes that humanize the profile.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpen()}>
            Add entry
          </Button>
        </div>
        {status === "personal-saved" ? (
          <p className="text-sm text-emerald-600">Entry saved.</p>
        ) : status === "personal-deleted" ? (
          <p className="text-sm text-emerald-600">Removed entry {detail ? `“${detail}”` : ""}.</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Icon</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{entry.title}</td>
                    <td className="text-muted-foreground px-3 py-2">{entry.description}</td>
                    <td className="px-3 py-2">{entry.icon_slug ?? "—"}</td>
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
                  <td colSpan={5} className="text-muted-foreground px-3 py-6 text-center">
                    No entries yet. Add 3–4 cards such as interests, hobbies, languages, or
                    collaboration style.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal open={open} onClose={handleClose} title={selected ? "Edit entry" : "Add entry"}>
        <form
          id="personal-entry-form"
          key={selected?.id ?? "create"}
          action={upsertProfilePersonalEntry}
          className="grid gap-3"
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="personal-entry-title">
              Title
            </label>
            <Input
              id="personal-entry-title"
              name="title"
              defaultValue={selected?.title ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="personal-entry-description">
              Description
            </label>
            <Textarea
              id="personal-entry-description"
              name="description"
              rows={3}
              defaultValue={selected?.description ?? ""}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="personal-entry-icon">
                Icon slug
              </label>
              <Input
                id="personal-entry-icon"
                name="icon_slug"
                defaultValue={selected?.icon_slug ?? ""}
                placeholder="homeassistant, strava, slack"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="personal-entry-order">
                Order index
              </label>
              <Input
                id="personal-entry-order"
                name="order_index"
                type="number"
                defaultValue={selected?.order_index ?? entries.length}
                min={0}
              />
            </div>
          </div>
        </form>
        <div className="flex items-center justify-between gap-3 pt-4">
          {selected ? (
            <form
              action={deleteProfilePersonalEntry}
              onSubmit={(event) => {
                if (!confirm("Delete this entry?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="title" value={selected.title} />
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
            <Button type="submit" form="personal-entry-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
