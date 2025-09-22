"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/admin/modal";
import type { MdxDocument } from "@/lib/supabase/types";

import { deleteDocument, toggleDeleted, upsertMdxDocument } from "./actions";

export function MdxDocumentsManager({ initialDocs }: { initialDocs: MdxDocument[] }) {
  const [filter, setFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selected, setSelected] = useState<MdxDocument | null>(null);
  const [open, setOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const docs = useMemo(
    () =>
      initialDocs
        .filter((d) => (showDeleted ? true : !d.deleted))
        .filter((d) => (filter ? d.key.toLowerCase().includes(filter.toLowerCase()) : true)),
    [initialDocs, filter, showDeleted]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">MDX Documents</h1>
          <p className="text-muted-foreground text-sm">Create, link, and manage MDX content bodies.</p>
        </div>
      </header>


      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Click a row to edit. Toggle deleted to keep non-destructively.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search by key..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-64"
              />
              <label className="text-sm font-medium flex items-center gap-2">
                <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} /> Show deleted
              </label>
              <Button
                size="sm"
                onClick={() => {
                  setSelected(null);
                  setPreviewHtml("");
                  setOpen(true);
                }}
              >
                Add document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b">
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">Deleted</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <button
                        className="hover:underline"
                        onClick={() => {
                          setSelected(d);
                          setPreviewHtml("");
                          setOpen(true);
                        }}
                      >
                        {d.key}
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(d.updated_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{d.deleted ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <form action={toggleDeleted} className="inline-flex items-center gap-2">
                        <input type="hidden" name="id" value={d.id} />
                        <input type="hidden" name="deleted" value={JSON.stringify(!d.deleted)} />
                        <Button size="sm" variant="outline" type="submit">{d.deleted ? "Restore" : "Soft delete"}</Button>
                      </form>
                      <form action={deleteDocument} className="inline-flex items-center gap-2 ml-2">
                        <input type="hidden" name="id" value={d.id} />
                        <Button size="sm" variant="destructive" type="submit">Delete</Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={selected ? "Edit document" : "Create document"}>
        <form
          action={async (formData) => {
            await upsertMdxDocument(formData);
            const key = (formData.get("key")?.toString() ?? "").trim();
            const content = formData.get("content")?.toString() ?? "";
            setSelected({
              id: formData.get("id")?.toString() ?? selected?.id ?? "",
              key,
              content,
              deleted: false,
              created_at: selected?.created_at ?? new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setOpen(false);
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="mdx-key">Key</label>
            <Input id="mdx-key" name="key" defaultValue={selected?.key ?? ""} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="mdx-content">Content</label>
            <Textarea
              id="mdx-content"
              name="content"
              rows={18}
              defaultValue={selected?.content ?? ""}
              required
              onScroll={(event) => {
                const el = event.currentTarget;
                const preview = document.getElementById("mdx-preview-pane");
                if (preview) {
                  const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
                  preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const el = document.getElementById("mdx-content") as HTMLTextAreaElement | null;
                  const value = el?.value ?? "";
                  const res = await fetch("/api/admin/mdx-preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ source: value }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setPreviewHtml(data.html);
                  }
                }}
              >
                Refresh preview
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div
              id="mdx-preview-pane"
              className="text-muted-foreground h-[32rem] overflow-auto rounded-md border p-3 text-sm leading-6 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 md:col-span-2">
            {selected ? (
              <Button
                variant="destructive"
                formAction={deleteDocument}
                formMethod="post"
                onClick={(event) => {
                  if (!confirm("Permanently delete this document?")) {
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
              <Button type="submit">{selected ? "Save" : "Create"}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
