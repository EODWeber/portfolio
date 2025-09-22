"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/admin/modal";
import type { MdxDocument } from "@/lib/supabase/types";

import { deleteDocument, toggleDeleted, upsertMdxDocument } from "./actions";
import { Modal } from "@/components/admin/modal";

type SortKey = "key" | "updated" | "deleted";
type SortDirection = "asc" | "desc";
type DeletedFilter = "active" | "deleted" | "all";

export function MdxDocumentsManager({ initialDocs }: { initialDocs: MdxDocument[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>("active");
  const [selected, setSelected] = useState<MdxDocument | null>(null);
  const [open, setOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "updated", direction: "desc" });

  const docs = useMemo(() => {
    const filtered = initialDocs
      .filter((doc) =>
        filter ? doc.key.toLowerCase().includes(filter.toLowerCase()) : true,
      )
      .filter((doc) => {
        if (deletedFilter === "all") return true;
        if (deletedFilter === "active") return !doc.deleted;
        return doc.deleted;
      });

    const direction = sort.direction === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sort.key) {
        case "key":
          return a.key.localeCompare(b.key) * direction;
        case "deleted":
          if (a.deleted === b.deleted) return 0;
          return (a.deleted ? 1 : -1) * direction;
        case "updated":
        default:
          return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * direction;
      }
    });
  }, [initialDocs, filter, deletedFilter, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" },
    );
  };

  const indicator = (key: SortKey) => {
    if (sort.key !== key) return null;
    return sort.direction === "asc" ? "↑" : "↓";
  };

  const handleOpen = (doc: MdxDocument | null) => {
    setSelected(doc);
    setPreviewHtml("");
    setOpen(true);
  };

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
          <div className="flex items-end justify-between gap-3">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Search, sort, and manage source MDX content.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search by key..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-64"
              />
              <select
                aria-label="Filter by deleted state"
                value={deletedFilter}
                onChange={(event) => setDeletedFilter(event.target.value as DeletedFilter)}
                className="border-input bg-background focus:ring-ring rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <option value="active">Active</option>
                <option value="deleted">Deleted only</option>
                <option value="all">All documents</option>
              </select>
              <Button size="sm" onClick={() => handleOpen(null)}>
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
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("key")}>
                      Key {indicator("key")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("updated")}>
                      Updated {indicator("updated")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("deleted")}>
                      Deleted {indicator("deleted")}
                    </button>
                  </th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <button className="hover:underline" onClick={() => handleOpen(doc)}>
                        {doc.key}
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(doc.updated_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{doc.deleted ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <form action={toggleDeleted} className="inline-flex items-center gap-2">
                        <input type="hidden" name="id" value={doc.id} />
                        <input type="hidden" name="deleted" value={JSON.stringify(!doc.deleted)} />
                        <Button size="sm" variant="outline" type="submit">
                          {doc.deleted ? "Restore" : "Soft delete"}
                        </Button>
                      </form>
                      <form action={deleteDocument} className="ml-2 inline-flex items-center gap-2">
                        <input type="hidden" name="id" value={doc.id} />
                        <Button
                          size="sm"
                          variant="destructive"
                          type="submit"
                          onClick={(event) => {
                            if (!confirm("Delete this document?")) event.preventDefault();
                          }}
                        >
                          Delete
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelected(null);
          setPreviewHtml("");
        }}
        title={selected ? "Edit document" : "Create document"}
      >
        <form
          key={selected?.id ?? "create"}
          action={async (formData) => {
            await upsertMdxDocument(formData);
            setOpen(false);
            setPreviewHtml("");
            setSelected(null);
            router.refresh();
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="key">
              Key
            </label>
            <Input id="key" name="key" defaultValue={selected?.key ?? ""} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="content">
              Content
            </label>
            <Textarea
              id="content"
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
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                onClick={async () => {
                  const textarea = document.getElementById("content") as HTMLTextAreaElement | null;
                  const value = textarea?.value ?? "";
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div
              id="mdx-preview-pane"
              className="text-muted-foreground h-[30rem] overflow-auto rounded-md border p-3 text-sm leading-6 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelected(null);
                setPreviewHtml("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{selected ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
