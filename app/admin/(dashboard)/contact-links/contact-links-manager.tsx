"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ContactLink } from "@/lib/supabase/types";

import { deleteContactLink, upsertContactLink } from "./actions";
import { Modal } from "@/components/admin/modal";

type SortKey = "label" | "category" | "order" | "updated";
type SortDirection = "asc" | "desc";

export function ContactLinksManager({ links, status }: { links: ContactLink[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "order", direction: "asc" });

  const categories = useMemo(() => {
    const unique = new Set<string>();
    links.forEach((link) => {
      if (link.category) unique.add(link.category);
    });
    return Array.from(unique).sort();
  }, [links]);

  const selected = useMemo(() => links.find((link) => link.id === selectedId), [links, selectedId]);

  const list = useMemo(() => {
    const filtered = links
      .filter((link) =>
        query
          ? [link.label, link.url, link.category ?? "", link.icon ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase())
          : true,
      )
      .filter((link) => (categoryFilter === "all" ? true : link.category === categoryFilter));

    const direction = sort.direction === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sort.key) {
        case "label":
          return a.label.localeCompare(b.label) * direction;
        case "category":
          return (a.category ?? "").localeCompare(b.category ?? "") * direction;
        case "order":
          return (a.order_index - b.order_index) * direction;
        case "updated":
          return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * direction;
        default:
          return 0;
      }
    });
  }, [links, query, categoryFilter, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => (prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }));
  };

  const indicator = (key: SortKey) => {
    if (sort.key !== key) return null;
    return sort.direction === "asc" ? "↑" : "↓";
  };

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
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search label or URL..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64"
            />
            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="border-input bg-background focus:ring-ring rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => {
                setSelectedId("");
                setOpen(true);
              }}
            >
              Add link
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
          <CardTitle>Links</CardTitle>
          <CardDescription>Click edit to update an existing contact method.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b">
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("label")}>
                      Label {indicator("label")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("category")}>
                      Category {indicator("category")}
                    </button>
                  </th>
                  <th className="px-3 py-2">URL</th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("order")}>
                      Order {indicator("order")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("updated")}>
                      Updated {indicator("updated")}
                    </button>
                  </th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((link) => (
                  <tr key={link.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{link.label}</td>
                    <td className="px-3 py-2">{link.category ?? "—"}</td>
                    <td className="px-3 py-2 break-all">{link.url}</td>
                    <td className="px-3 py-2">{link.order_index}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(link.updated_at).toLocaleString()}</td>
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

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedId("");
        }}
        title={selected ? "Edit contact link" : "Add contact link"}
      >
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
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedId("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={() => setOpen(false)}>
              {selected ? "Save link" : "Create link"}
            </Button>
          </div>
        </form>
        {selected ? (
          <form
            action={deleteContactLink}
            className="mt-4 flex justify-between"
            onSubmit={(event) => {
              if (!confirm("Delete this contact link?")) event.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={selected.id} />
            <Button variant="destructive" type="submit">
              Delete contact link
            </Button>
            <span />
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
