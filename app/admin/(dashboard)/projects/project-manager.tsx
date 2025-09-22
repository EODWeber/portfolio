"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/admin/modal";
import type { Project } from "@/lib/supabase/types";

import { deleteProject, importProjects, upsertProject, toggleProjectFeatured } from "./actions";

const FORM_GRID = "grid gap-3 md:grid-cols-2";

export function ProjectManager({ projects, status }: { projects: Project[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => projects.find((project) => project.id === selectedId),
    [projects, selectedId],
  );

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(projects, null, 2));
    } catch (error) {
      console.error("Unable to copy projects export", error);
    }
  };

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        query
          ? [p.title, p.slug, p.vertical, ...(p.tags ?? []), ...(p.tech_stack ?? [])]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(query.toLowerCase()))
          : true,
      ),
    [projects, query],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Projects</h1>
            <p className="text-muted-foreground text-sm">
              Manage portfolio entries backing the public portfolio and vertical pages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              placeholder="Search title, slug, tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Button
              size="sm"
              onClick={() => {
                setSelectedId("");
                setOpen(true);
              }}
            >
              Add project
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyExport}>
            Copy JSON export
          </Button>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Project saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Project deleted.</p>
        ) : status === "imported" ? (
          <p className="text-sm text-emerald-600">Projects imported.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>List</CardTitle>
          <CardDescription>Click Edit to modify; use Add to create a project.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Vertical</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Featured</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{p.title}</td>
                    <td className="px-3 py-2">{p.slug}</td>
                    <td className="px-3 py-2">{p.vertical}</td>
                    <td className="px-3 py-2 capitalize">{p.status}</td>
                    <td className="px-3 py-2">
                      <form action={toggleProjectFeatured}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button size="sm" variant={p.featured ? "default" : "outline"}>{p.featured ? "Featured" : "Feature"}</Button>
                      </form>
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedId(p.id);
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

      <Modal open={open} onClose={() => setOpen(false)} title={selected ? "Edit project" : "Add project"}>
        <form key={selected?.id ?? "create"} action={upsertProject} className={FORM_GRID}>
            <input type="hidden" name="id" value={selected?.id ?? ""} />
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="title">
                Title
              </label>
              <Input id="title" name="title" defaultValue={selected?.title ?? ""} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="hero_image">Cover image</label>
              <input id="hero_image" name="hero_image" type="file" accept="image/*" className="text-sm" />
              {selected?.hero_url ? (
                <p className="text-xs text-muted-foreground">Current: {selected.hero_url}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="slug">
                Slug
              </label>
              <Input id="slug" name="slug" defaultValue={selected?.slug ?? ""} required />
            </div>
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
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="summary">
                Summary
              </label>
              <Textarea
                id="summary"
                name="summary"
                defaultValue={selected?.summary ?? ""}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="tags">
                Tags (comma separated)
              </label>
              <Input
                id="tags"
                name="tags"
                defaultValue={selected ? selected.tags.join(", ") : ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="tech_stack">
                Tech stack (comma separated)
              </label>
              <Input
                id="tech_stack"
                name="tech_stack"
                defaultValue={selected ? selected.tech_stack.join(", ") : ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="repo_url">
                Repo URL
              </label>
              <Input id="repo_url" name="repo_url" defaultValue={selected?.repo_url ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="hero_url">
                Hero image URL
              </label>
              <Input id="hero_url" name="hero_url" defaultValue={selected?.hero_url ?? ""} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="outcomes">
                Outcomes (one per line: Metric|Value)
              </label>
              <Textarea
                id="outcomes"
                name="outcomes"
                defaultValue={formatOutcomes(selected)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selected?.status ?? "draft"}
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="featured" name="featured" type="checkbox" defaultChecked={selected?.featured ?? false} />
              <label htmlFor="featured" className="text-sm font-medium">Featured (max 6)</label>
            </div>
            <div className="flex items-center justify-between gap-2 md:col-span-2">
              {selected ? (
                <Button
                  variant="destructive"
                  formAction={deleteProject}
                  formMethod="post"
                  onClick={(event) => {
                    if (!confirm("Delete this project?")) {
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
                <Button type="submit" onClick={() => setOpen(false)}>{selected ? "Save project" : "Create project"}</Button>
              </div>
            </div>
          </form>
      </Modal>
      <Card>
        <CardHeader>
          <CardTitle>Bulk import</CardTitle>
          <CardDescription>Paste a JSON array exported above to upsert multiple records at once.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={importProjects} className="space-y-3">
            <textarea
              name="payload"
              rows={6}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder='[{"title":"Example","slug":"example","summary":"Impact...","vertical":"ai-security"}]'
            />
            <Button type="submit" variant="outline">
              Import JSON
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function formatOutcomes(project: Project | undefined) {
  if (!project?.outcomes) return "";
  return project.outcomes.map((outcome) => `${outcome.metric}|${outcome.value}`).join("\n");
}
