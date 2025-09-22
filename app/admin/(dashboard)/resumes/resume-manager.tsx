"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Resume } from "@/lib/supabase/types";

import { deleteResume, setPrimaryResume, toggleArchiveResume, upsertResume } from "./actions";
import { Modal } from "@/components/admin/modal";

const VERTICAL_OPTIONS = ["ai-security", "secure-devops", "soc"] as const;
type VerticalFilter = (typeof VERTICAL_OPTIONS)[number] | "all";
type SortKey = "label" | "vertical" | "published" | "uploaded" | "featured";
type SortDirection = "asc" | "desc";

type ResumeManagerProps = { resumes: Resume[]; status?: string };

export function ResumeManager({ resumes, status }: ResumeManagerProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [verticalFilter, setVerticalFilter] = useState<VerticalFilter>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "featured", direction: "desc" });

  const selected = useMemo(
    () => resumes.find((resume) => resume.id === selectedId) ?? null,
    [resumes, selectedId],
  );

  const list = useMemo(() => {
    const filtered = resumes
      .filter((resume) => (showArchived ? true : !resume.archived))
      .filter((resume) => (verticalFilter === "all" ? true : resume.vertical === verticalFilter))
      .filter((resume) =>
        query
          ? `${resume.label} ${resume.vertical}`
            .toLowerCase()
            .includes(query.toLowerCase())
          : true,
      );

    const direction = sort.direction === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sort.key) {
        case "label":
          return a.label.localeCompare(b.label) * direction;
        case "vertical":
          return a.vertical.localeCompare(b.vertical) * direction;
        case "published": {
          const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
          const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
          return (aDate - bDate) * direction;
        }
        case "uploaded": {
          const aDate = new Date(a.created_at ?? a.updated_at).getTime();
          const bDate = new Date(b.created_at ?? b.updated_at).getTime();
          return (aDate - bDate) * direction;
        }
        case "featured":
        default: {
          if (a.featured === b.featured) {
            const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
            const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
            return (aDate - bDate) * direction;
          }
          return sort.direction === "asc"
            ? a.featured
              ? 1
              : -1
            : a.featured
              ? -1
              : 1;
        }
      }
    });
  }, [resumes, showArchived, verticalFilter, query, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" },
    );
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
            <h1 className="text-3xl font-semibold">Resumes</h1>
            <p className="text-muted-foreground text-sm">
              Manage Supabase Storage-backed resumes served on the resume, portfolio, and contact pages.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search label or vertical..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64"
            />
            <select
              aria-label="Filter by vertical"
              value={verticalFilter}
              onChange={(event) => setVerticalFilter(event.target.value as VerticalFilter)}
              className="border-input bg-background focus:ring-ring rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="all">All verticals</option>
              {VERTICAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium flex items-center gap-2">
              <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
              Show archived
            </label>
            <Button
              size="sm"
              onClick={() => {
                setSelectedId("");
                setOpen(true);
              }}
            >
              Add resume
            </Button>
          </div>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Resume saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Resume deleted.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Resumes</CardTitle>
          <CardDescription>Filter, sort, and manage resume availability.</CardDescription>
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
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("vertical")}>
                      Vertical {indicator("vertical")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("published")}>
                      Published {indicator("published")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("uploaded")}>
                      Uploaded {indicator("uploaded")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("featured")}>
                      Primary {indicator("featured")}
                    </button>
                  </th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((resume) => (
                  <tr key={resume.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{resume.label}</td>
                    <td className="px-3 py-2">{resume.vertical}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {resume.published_at ? new Date(resume.published_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(resume.created_at ?? resume.updated_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{resume.featured ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <form action={setPrimaryResume}>
                          <input type="hidden" name="id" value={resume.id} />
                          <Button size="sm" variant={resume.featured ? "default" : "outline"} type="submit">
                            {resume.featured ? "Unset primary" : "Set primary"}
                          </Button>
                        </form>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedId(resume.id);
                            setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
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
        title={selected ? "Edit resume" : "Add resume"}
      >
        <form id="resume-form" key={selected?.id ?? "create"} action={upsertResume} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="vertical">
              Vertical
            </label>
            <select
              id="vertical"
              name="vertical"
              defaultValue={selected?.vertical ?? "ai-security"}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {VERTICAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="label">
              Label
            </label>
            <Input id="label" name="label" defaultValue={selected?.label ?? ""} required />
          </div>
          {selected ? (
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-muted-foreground">Current file: {selected.file_path}</p>
            </div>
          ) : (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="file">
                Resume PDF
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept="application/pdf"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="published_at">
              Published date
            </label>
            <Input
              id="published_at"
              name="published_at"
              type="date"
              defaultValue={selected?.published_at ? new Date(selected.published_at).toISOString().slice(0, 10) : ""}
            />
          </div>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {selected ? (
            <div className="flex items-center gap-2">
              <form action={toggleArchiveResume}>
                <input type="hidden" name="id" value={selected.id} />
                <Button variant="outline" type="submit">
                  {selected.archived ? "Restore" : "Archive"}
                </Button>
              </form>
              <form
                action={deleteResume}
                onSubmit={(event) => {
                  if (!confirm("Delete this resume and remove the file?")) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={selected.id} />
                <Button variant="destructive" type="submit">
                  Delete
                </Button>
              </form>
            </div>
          ) : (
            <span />
          )}
          <div className="flex items-center justify-end gap-2 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedId("");
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="resume-form">{selected ? "Save resume" : "Upload PDF & Save"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
