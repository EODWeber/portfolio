"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileCareerHighlight } from "@/lib/supabase/types";

import { deleteProfileCareerHighlight, upsertProfileCareerHighlight } from "./actions";

type Props = {
  highlights: ProfileCareerHighlight[];
  status?: string;
  detail?: string;
};

export function CareerHighlightsManager({ highlights, status, detail }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(
    () => highlights.find((highlight) => highlight.id === selectedId) ?? null,
    [highlights, selectedId],
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
            <CardTitle>Career highlights</CardTitle>
            <CardDescription>
              Condensed timeline entries that back up your expertise claims.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpen()}>
            Add highlight
          </Button>
        </div>
        {status === "career-saved" ? (
          <p className="text-sm text-emerald-600">Highlight saved.</p>
        ) : status === "career-deleted" ? (
          <p className="text-sm text-emerald-600">
            Removed highlight {detail ? `“${detail}”` : ""}.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {highlights.length > 0 ? (
                highlights.map((highlight) => (
                  <tr key={highlight.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{highlight.title}</td>
                    <td className="text-muted-foreground px-3 py-2">{highlight.description}</td>
                    <td className="break-all px-3 py-2">{highlight.link_url ?? "—"}</td>
                    <td className="px-3 py-2">{highlight.order_index}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(highlight.id)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-muted-foreground px-3 py-6 text-center">
                    No highlights yet. Add 3–5 achievements with measurable impact.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal
        open={open}
        onClose={handleClose}
        title={selected ? "Edit highlight" : "Add highlight"}
      >
        <form
          id="career-highlight-form"
          key={selected?.id ?? "create"}
          action={upsertProfileCareerHighlight}
          className="grid gap-3"
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="highlight-title">
              Title
            </label>
            <Input
              id="highlight-title"
              name="title"
              defaultValue={selected?.title ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="highlight-description">
              Description
            </label>
            <Textarea
              id="highlight-description"
              name="description"
              rows={3}
              defaultValue={selected?.description ?? ""}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="highlight-link-label">
                Link label
              </label>
              <Input
                id="highlight-link-label"
                name="link_label"
                defaultValue={selected?.link_label ?? ""}
                placeholder="Read the case study"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="highlight-link-url">
                Link URL
              </label>
              <Input
                id="highlight-link-url"
                name="link_url"
                defaultValue={selected?.link_url ?? ""}
                placeholder="/case-studies"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="highlight-order">
              Order index
            </label>
            <Input
              id="highlight-order"
              name="order_index"
              type="number"
              defaultValue={selected?.order_index ?? highlights.length}
              min={0}
            />
          </div>
        </form>
        <div className="flex items-center justify-between gap-3 pt-4">
          {selected ? (
            <form
              action={deleteProfileCareerHighlight}
              onSubmit={(event) => {
                if (!confirm("Delete this highlight?")) event.preventDefault();
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
            <Button type="submit" form="career-highlight-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
