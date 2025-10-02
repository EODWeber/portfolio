"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfilePillar } from "@/lib/supabase/types";

import { deleteProfilePillar, upsertProfilePillar } from "./actions";

type Props = {
  pillars: ProfilePillar[];
  status?: string;
  detail?: string;
};

export function PillarsManager({ pillars, status, detail }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(
    () => pillars.find((pillar) => pillar.id === selectedId) ?? null,
    [pillars, selectedId],
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
            <CardTitle>Core expertise pillars</CardTitle>
            <CardDescription>
              Curate the domains highlighted on the public profile hero. Icons reference
              simple-icons slugs.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpen()}>
            Add pillar
          </Button>
        </div>
        {status === "pillar-saved" ? (
          <p className="text-sm text-emerald-600">Pillar saved.</p>
        ) : status === "pillar-deleted" ? (
          <p className="text-sm text-emerald-600">Removed pillar {detail ? `“${detail}”` : ""}.</p>
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
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pillars.length > 0 ? (
                pillars.map((pillar) => (
                  <tr key={pillar.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{pillar.title}</td>
                    <td className="text-muted-foreground px-3 py-2">{pillar.description}</td>
                    <td className="px-3 py-2">{pillar.icon_slug ?? "—"}</td>
                    <td className="break-all px-3 py-2">{pillar.link_url ?? "—"}</td>
                    <td className="px-3 py-2">{pillar.order_index}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(pillar.id)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-3 py-6 text-center">
                    No pillars yet. Add 3–4 pillars that represent your focus areas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal open={open} onClose={handleClose} title={selected ? "Edit pillar" : "Add pillar"}>
        <form
          id="pillar-form"
          key={selected?.id ?? "create"}
          action={upsertProfilePillar}
          className="grid gap-3"
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="pillar-title">
              Title
            </label>
            <Input id="pillar-title" name="title" defaultValue={selected?.title ?? ""} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="pillar-description">
              Description
            </label>
            <Textarea
              id="pillar-description"
              name="description"
              rows={3}
              defaultValue={selected?.description ?? ""}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pillar-icon">
                Icon slug
              </label>
              <Input
                id="pillar-icon"
                name="icon_slug"
                defaultValue={selected?.icon_slug ?? ""}
                placeholder="openai, githubactions"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pillar-order">
                Order index
              </label>
              <Input
                id="pillar-order"
                name="order_index"
                type="number"
                defaultValue={selected?.order_index ?? pillars.length}
                min={0}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pillar-link-label">
                Link label
              </label>
              <Input
                id="pillar-link-label"
                name="link_label"
                defaultValue={selected?.link_label ?? ""}
                placeholder="View AI security work"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pillar-link-url">
                Link URL
              </label>
              <Input
                id="pillar-link-url"
                name="link_url"
                defaultValue={selected?.link_url ?? ""}
                placeholder="/portfolio?tag=ai-security"
              />
            </div>
          </div>
        </form>
        <div className="flex items-center justify-between gap-3 pt-4">
          {selected ? (
            <form
              action={deleteProfilePillar}
              onSubmit={(event) => {
                if (!confirm("Delete this pillar?")) event.preventDefault();
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
            <Button type="submit" form="pillar-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
