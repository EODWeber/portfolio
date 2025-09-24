"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ContactLink } from "@/lib/supabase/types";

import { deleteContactLink, upsertContactLink } from "./actions";

const FORM_GRID = "grid gap-3 md:grid-cols-2";

export function ContactLinksManager({ links, status }: { links: ContactLink[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => links.find((link) => link.id === selectedId) ?? null,
    [links, selectedId],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return links;
    return links.filter((link) =>
      [link.label, link.url, link.category ?? "", link.icon ?? ""].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [links, query]);

  const handleOpen = (id?: string) => {
    setSelectedId(id ?? "");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId("");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Contact methods</h1>
            <p className="text-muted-foreground text-sm">
              Manage the destinations surfaced on the public contact page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search label, url, category..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64"
            />
            <Button size="sm" onClick={() => handleOpen()}>
              Add method
            </Button>
          </div>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Contact method saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Contact method deleted.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Use the table to quickly locate and edit entries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr className="border-b">
                  <th className="px-3 py-2">Label</th>
                  <th className="px-3 py-2">URL</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link) => (
                  <tr key={link.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{link.label}</td>
                    <td className="break-all px-3 py-2">{link.url}</td>
                    <td className="px-3 py-2">{link.category ?? "—"}</td>
                    <td className="px-3 py-2">{link.order_index}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(link.id)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={open} onClose={handleClose} title={selected ? "Edit method" : "Add method"}>
        <form
          id="contact-link-form"
          key={selected?.id ?? "create"}
          action={upsertContactLink}
          className={FORM_GRID}
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="label">
              Label
            </label>
            <Input id="label" name="label" defaultValue={selected?.label ?? ""} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="url">
              URL / mailto
            </label>
            <Input id="url" name="url" defaultValue={selected?.url ?? ""} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="category">
              Category
            </label>
            <Input
              id="category"
              name="category"
              defaultValue={selected?.category ?? ""}
              placeholder="primary, social, etc."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="icon">
              Icon
            </label>
            <Input
              id="icon"
              name="icon"
              defaultValue={selected?.icon ?? ""}
              placeholder="github, linkedin"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="order_index">
              Order index
            </label>
            <Input
              id="order_index"
              name="order_index"
              type="number"
              defaultValue={selected?.order_index ?? links.length}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form="contact-link-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </form>
        {selected ? (
          <div className="flex items-center justify-between pt-3">
            <form
              action={deleteContactLink}
              onSubmit={(event) => {
                if (!confirm("Delete this contact method?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="label" value={selected.label} />
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </form>
            <span />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
