"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Resume } from "@/lib/supabase/types";

import { deleteResume, upsertResume, setPrimaryResume, toggleArchiveResume, updateResumePublishedDate } from "./actions";
import { Modal } from "@/components/admin/modal";

export function ResumeManager({ resumes, status }: { resumes: Resume[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(
    () => resumes.find((resume) => resume.id === selectedId),
    [resumes, selectedId],
  );
  const [showArchived, setShowArchived] = useState(false);
  const sorted = useMemo(() => {
    const list = showArchived ? resumes : resumes.filter((r) => !r.archived);
    return [...list].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const aDate = a.published_at ? new Date(a.published_at).getTime() : new Date((a.created_at ?? a.updated_at)).getTime();
      const bDate = b.published_at ? new Date(b.published_at).getTime() : new Date((b.created_at ?? b.updated_at)).getTime();
      return bDate - aDate;
    });
  }, [resumes, showArchived]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Resumes</h1>
            <p className="text-muted-foreground text-sm">
              Manage Supabase Storage-backed resumes served on the resume, portfolio, and contact
              pages.
            </p>
          </div>
            <div className="flex items-center gap-3">
              <input
                placeholder="Search label or vertical..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <label className="text-sm font-medium flex items-center gap-2">
                <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived
              </label>
              <Button size="sm" onClick={() => { setSelectedId(""); setOpen(true); }}>Add resume</Button>
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
          <CardTitle>List</CardTitle>
          <CardDescription>Click Edit to modify; use Add to upload new PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b">
                  <th className="px-3 py-2">Label</th>
                  <th className="px-3 py-2">Vertical</th>
                  <th className="px-3 py-2">Published</th>
                  <th className="px-3 py-2">Uploaded</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.filter(r => (query ? (r.label + r.vertical).toLowerCase().includes(query.toLowerCase()) : true)).map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{r.label}</td>
                    <td className="px-3 py-2">{r.vertical}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date((r.created_at ?? r.updated_at)).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <form action={setPrimaryResume} className="inline-block">
                        <input type="hidden" name="id" value={r.id} />
                        <Button size="sm" variant={r.featured ? "default" : "outline"}>{r.featured ? "Primary" : "Set primary"}</Button>
                      </form>
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => { setSelectedId(r.id); setOpen(true); }}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={selected ? "Upload new version" : "Add resume"}>
        <form key={selected?.id ?? "create"} action={upsertResume} className="grid gap-3 md:grid-cols-2">
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
                <option value="ai-security">AI Security</option>
                <option value="secure-devops">Secure DevOps</option>
                <option value="soc">SOC</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="label">
                Label
              </label>
              <Input id="label" name="label" defaultValue={selected?.label ?? ""} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="file">Resume PDF</label>
              <input
                id="file"
                name="file"
                type="file"
                accept="application/pdf"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selected?.file_path ? (
                <p className="text-xs text-muted-foreground">Current: {selected.file_path}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="published_at">Published</label>
              <form action={updateResumePublishedDate} className="flex items-center gap-2">
                <input type="hidden" name="id" value={selected?.id ?? ""} />
                <input id="published_at" name="published_at" type="date" defaultValue={selected?.published_at ? new Date(selected.published_at).toISOString().slice(0,10) : ""} className="w-44 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <Button size="sm" variant="outline" type="submit">Save date</Button>
              </form>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => { setSelectedId(""); setOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" onClick={() => setOpen(false)}>{selected ? "Save resume" : "Upload PDF & Save"}</Button>
            </div>
          </form>
          {selected ? (
            <form
              action={deleteResume}
              className="flex justify-between pt-3"
              onSubmit={(e) => {
                if (!confirm("Delete this resume? This cannot be undone.")) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <div className="flex items-center gap-2">
                <form action={toggleArchiveResume} onSubmit={(e) => { /* intentially no confirm for archive */ }}>
                  <input type="hidden" name="id" value={selected.id} />
                  <Button variant="outline" type="submit">{selected.archived ? "Restore" : "Archive"}</Button>
                </form>
              </div>
              <Button variant="destructive" type="submit">Delete resume</Button>
            </form>
          ) : null}
      </Modal>
    </div>
  );
}
