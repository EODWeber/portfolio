"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Project, CaseStudy } from "@/lib/supabase/types";
import { Modal } from "@/components/admin/modal";

import { deleteProject, importProjects, toggleProjectFeatured, upsertProject } from "./actions";

const FORM_GRID = "grid gap-3 md:grid-cols-2";
type SortKey = "title" | "slug" | "vertical" | "status" | "featured" | "updated";
type SortDirection = "asc" | "desc";

export function ProjectManager({
  projects,
  caseStudies,
  relatedCaseStudyIdsByProject,
  status,
}: {
  projects: Project[];
  caseStudies: CaseStudy[];
  relatedCaseStudyIdsByProject: Record<string, string[]>;
  status?: string;
}) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "updated",
    direction: "desc",
  });

  const selected = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) =>
      [project.title, project.slug, project.vertical, project.summary]
        .concat(project.tags ?? [])
        .concat(project.tech_stack ?? [])
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [projects, query]);

  const displayed = useMemo(() => {
    const items = [...filtered];
    const direction = sort.direction === "asc" ? 1 : -1;

    return items.sort((a, b) => {
      switch (sort.key) {
        case "title":
          return a.title.localeCompare(b.title) * direction;
        case "slug":
          return a.slug.localeCompare(b.slug) * direction;
        case "vertical":
          return a.vertical.localeCompare(b.vertical) * direction;
        case "status":
          return a.status.localeCompare(b.status) * direction;
        case "featured": {
          const af = a.featured ? 1 : 0;
          const bf = b.featured ? 1 : 0;
          return (af - bf) * direction;
        }
        case "updated":
        default:
          return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * direction;
      }
    });
  }, [filtered, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const indicator = (key: SortKey) => {
    if (sort.key !== key) return null;
    return sort.direction === "asc" ? "↑" : "↓";
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(projects, null, 2));
    } catch (error) {
      console.error("Unable to copy projects export", error);
    }
  };

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
            <h1 className="text-3xl font-semibold">Projects</h1>
            <p className="text-muted-foreground text-sm">
              Manage portfolio entries backing the public portfolio and vertical pages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search title, slug, tag..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64"
            />
            <Button size="sm" onClick={() => handleOpen()}>
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
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Use the table to filter, feature, and edit individual projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr className="border-b">
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("title")}
                    >
                      Title {indicator("title")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("slug")}
                    >
                      Slug {indicator("slug")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("vertical")}
                    >
                      Vertical {indicator("vertical")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("status")}
                    >
                      Status {indicator("status")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("featured")}
                    >
                      Featured {indicator("featured")}
                    </button>
                  </th>
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("updated")}
                    >
                      Updated {indicator("updated")}
                    </button>
                  </th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((project) => (
                  <tr key={project.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{project.title}</td>
                    <td className="px-3 py-2">{project.slug}</td>
                    <td className="px-3 py-2">{project.vertical}</td>
                    <td className="px-3 py-2 capitalize">{project.status}</td>
                    <td className="px-3 py-2">
                      <form action={toggleProjectFeatured}>
                        <input type="hidden" name="id" value={project.id} />
                        <Button size="sm" variant={project.featured ? "default" : "outline"}>
                          {project.featured ? "Featured" : "Feature"}
                        </Button>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {new Date(project.updated_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(project.id)}>
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

      <Modal open={open} onClose={handleClose} title={selected ? "Edit project" : "Add project"}>
        <form
          id="project-form"
          key={selected?.id ?? "create"}
          action={upsertProject}
          className={FORM_GRID}
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <Input id="title" name="title" defaultValue={selected?.title ?? ""} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="hero_image">
              Cover image
            </label>
            <input
              id="hero_image"
              name="hero_image"
              type="file"
              accept="image/*"
              className="text-sm"
            />
            {selected?.hero_url ? (
              <p className="text-muted-foreground text-xs">Current: {selected.hero_url}</p>
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
            <Input id="tags" name="tags" defaultValue={selected ? selected.tags.join(", ") : ""} />
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
              defaultValue={formatOutcomes(selected ?? undefined)}
              rows={4}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Related case studies</label>
            <RelatedChecklist
              name="related_case_study_ids"
              items={caseStudies.map((s) => ({ id: s.id, label: `${s.title} (${s.slug})` }))}
              selected={(selected?.id && relatedCaseStudyIdsByProject[selected.id]) || []}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Related articles</label>
            <RelatedChecklist
              name="related_article_ids"
              items={articles.map((a) => ({ id: a.id, label: `${a.title} (${a.slug})` }))}
              selected={[]}
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
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={selected?.featured ?? false}
            />
            <label htmlFor="featured" className="text-sm font-medium">
              Featured (max 6)
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form="project-form">
              {selected ? "Save project" : "Create project"}
            </Button>
          </div>
        </form>
        {selected ? (
          <div className="flex items-center justify-between pt-3">
            <form
              action={deleteProject}
              onSubmit={(event) => {
                if (!confirm("Delete this project?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="label" value={selected.title} />
              <Button variant="destructive" type="submit">
                Delete project
              </Button>
            </form>
            <span />
          </div>
        ) : null}
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Bulk import</CardTitle>
          <CardDescription>
            Paste a JSON array exported above to upsert multiple records at once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={importProjects} className="space-y-3">
            <textarea
              name="payload"
              rows={6}
              required
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
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

function formatOutcomes(project: Project | null | undefined) {
  if (!project?.outcomes) return "";
  return project.outcomes.map((outcome) => `${outcome.metric}|${outcome.value}`).join("\n");
}

function RelatedChecklist({
  name,
  items,
  selected,
}: {
  name: string;
  items: Array<{ id: string; label: string }>;
  selected: string[];
}) {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<string[]>(selected);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
  }, [items, query]);
  const toggle = (id: string) =>
    setChosen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <div className="rounded-md border">
      <div className="flex items-center gap-2 border-b p-2">
        <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {chosen.map((id) => (
          <input key={id} type="hidden" name={name} value={id} />
        ))}
      </div>
      <div className="max-h-48 overflow-auto p-2 text-sm">
        <table className="w-full">
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id}>
                <td className="py-1">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={chosen.includes(i.id)}
                      onChange={() => toggle(i.id)}
                    />
                    {i.label}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
