"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MdxDocument } from "@/lib/supabase/types";

import { deleteDocument, toggleDeleted, upsertMdxDocument } from "./actions";

export function MdxDocumentsManager({ initialDocs }: { initialDocs: MdxDocument[] }) {
  const [filter, setFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selected, setSelected] = useState<MdxDocument | null>(null);
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
          <CardTitle>{selected ? "Edit document" : "Create document"}</CardTitle>
          <CardDescription>Keys should follow folder naming e.g. articles/my-post.mdx.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            action={async (formData) => {
              await upsertMdxDocument(formData);
              const key = (formData.get("key")?.toString() ?? "").trim();
              const content = formData.get("content")?.toString() ?? "";
              setSelected({ id: selected?.id ?? "", key, content, deleted: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <input type="hidden" name="id" value={selected?.id ?? ""} />
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="key">Key</label>
              <Input id="key" name="key" defaultValue={selected?.key ?? ""} required />
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium" htmlFor="content">Content</label>
              <Textarea
                id="content"
                name="content"
                rows={20}
                defaultValue={selected?.content ?? ""}
                required
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const preview = document.getElementById("mdx-preview-pane");
                  if (preview) {
                    const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
                    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
                  }
                }}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                  onClick={async () => {
                    const el = document.getElementById("content") as HTMLTextAreaElement | null;
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
                </button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium">Preview</label>
              <div
                id="mdx-preview-pane"
                className="text-muted-foreground h-[40rem] overflow-auto rounded-md border p-3 text-sm leading-6 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
            <div className="flex justify-end gap-2">
              {selected ? (
                <Button type="button" variant="outline" onClick={() => setSelected(null)}>Clear</Button>
              ) : null}
              <Button type="submit">{selected ? "Save" : "Create"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-end justify-between gap-3">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Click a row to edit. Toggle deleted to keep non-destructively.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Input placeholder="Search by key..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-64" />
              <label className="text-sm font-medium flex items-center gap-2">
                <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} /> Show deleted
              </label>
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
                      <button className="hover:underline" onClick={() => setSelected(d)}>{d.key}</button>
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
    </div>
  );
}
