"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/admin/modal";
import type { ContactLink } from "@/lib/supabase/types";

import { deleteContactLink, upsertContactLink } from "./actions";

export function ContactLinksManager({ links, status }: { links: ContactLink[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(() => links.find((link) => link.id === selectedId), [links, selectedId]);
  const filtered = useMemo(
    () =>
      links.filter((link) =>
        query
          ? [link.label, link.url, link.category ?? "", link.icon ?? ""]
              .some((value) => value.toLowerCase().includes(query.toLowerCase()))
          : true,
      ),
    [links, query],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Contact links</h1>
            <p className="text-muted-foreground text-sm">
              Manage the destinations surfaced on the public contact page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              placeholder="Search label, url, category..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Button
              size="sm"
              onClick={() => {
                setSelectedId("");
                setOpen(true);
              }}
            >
              Add contact link
            </Button>
          </div>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Contact link saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Contact link deleted.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contact links</CardTitle>
          <CardDescription>Links are ordered by `order_index` ascending.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
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
                    <td className="px-3 py-2">{link.url}</td>
                    <td className="px-3 py-2">{link.category ?? "—"}</td>
                    <td className="px-3 py-2">{link.order_index}</td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedId(link.id);
                          setOpen(true);
                        }}
                      >
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

      <Modal open={open} onClose={() => setOpen(false)} title={selected ? "Edit contact link" : "Add contact link"}>
        <form key={selected?.id ?? "create"} action={upsertContactLink} className="grid gap-3 md:grid-cols-2">
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
              <Input id="category" name="category" defaultValue={selected?.category ?? ""} placeholder="primary, social" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="icon">
                Icon
              </label>
              <Input id="icon" name="icon" defaultValue={selected?.icon ?? ""} placeholder="github, linkedin" />
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
            <div className="flex items-center justify-between gap-2 md:col-span-2">
              {selected ? (
                <Button
                  variant="destructive"
                  formAction={deleteContactLink}
                  formMethod="post"
                  onClick={(event) => {
                    if (!confirm("Delete this contact link?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  Delete
                </Button>
              ) : <div />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={() => setOpen(false)}>{selected ? "Save link" : "Create link"}</Button>
              </div>
            </div>
          </form>
      </Modal>
    </div>
  );
}
