"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Article, MdxDocument, Project, CaseStudy } from "@/lib/supabase/types";

import { deleteArticle, upsertArticle, importArticles } from "./actions";
import { Modal } from "@/components/admin/modal";

const FORM_GRID = "grid gap-3 md:grid-cols-2";

export function ArticleManager({
  articles,
  availableDocs,
  projects,
  caseStudies,
  relationsByArticle,
  status,
  usedKeys = [],
  errorMessage,
}: {
  articles: Article[];
  availableDocs: MdxDocument[];
  projects: Project[];
  caseStudies: CaseStudy[];
  relationsByArticle: Record<string, { projectIds: string[]; caseStudyIds: string[] }>;
  status?: string;
  usedKeys?: string[];
  errorMessage?: string;
}) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [mdxFilter, setMdxFilter] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [unlinkedOnly, setUnlinkedOnly] = useState<boolean>(false);
  const selected = useMemo(
    () => articles.find((article) => article.id === selectedId),
    [articles, selectedId],
  );
  const usedSet = useMemo(() => new Set(usedKeys), [usedKeys]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Articles</h1>
            <p className="text-muted-foreground text-sm">
              Manage long-form posts rendered in the articles section.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              placeholder="Search title, slug, tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-input bg-background focus:ring-ring w-64 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            />
            <Button
              size="sm"
              onClick={() => {
                setSelectedId("");
                setOpen(true);
              }}
            >
              Add article
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(articles, null, 2));
              } catch (error) {
                console.error("Unable to copy article export", error);
              }
            }}
          >
            Copy JSON export
          </Button>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Article saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Article deleted.</p>
        ) : status === "imported" ? (
          <p className="text-sm text-emerald-600">Articles imported.</p>
        ) : status === "error" ? (
          <p className="text-sm text-red-600">{errorMessage || "An error occurred."}</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{selected ? "Edit article" : "Add article"}</CardTitle>
          <CardDescription>Manage metadata and content body below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr className="border-b">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Tags</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles
                  .filter((a) =>
                    query
                      ? a.title.toLowerCase().includes(query.toLowerCase()) ||
                        a.slug.toLowerCase().includes(query.toLowerCase()) ||
                        (a.tags || []).some((t) => t.toLowerCase().includes(query.toLowerCase()))
                      : true,
                  )
                  .map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{a.title}</td>
                      <td className="px-3 py-2">{a.slug}</td>
                      <td className="px-3 py-2 capitalize">{a.status}</td>
                      <td className="px-3 py-2">{a.tags.join(", ")}</td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedId(a.id);
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
        onClose={() => setOpen(false)}
        title={selected ? "Edit article" : "Add article"}
      >
        <form
          id="article-form"
          key={selected?.id ?? "create"}
          action={upsertArticle}
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
            <label className="text-sm font-medium" htmlFor="tags">
              Tags (comma separated)
            </label>
            <Input id="tags" name="tags" defaultValue={selected ? selected.tags.join(", ") : ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="summary">
              TL;DR
            </label>
            <Textarea id="summary" name="summary" defaultValue={selected?.summary ?? ""} rows={3} />
          </div>
          {/* Link existing MDX (above editor) */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Related projects</label>
            <RelatedChecklist
              name="related_project_ids"
              items={projects.map((p) => ({ id: p.id, label: `${p.title} (${p.slug})` }))}
              selected={(selected?.id && relationsByArticle[selected.id]?.projectIds) || []}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Related case studies</label>
            <RelatedChecklist
              name="related_case_study_ids"
              items={caseStudies.map((s) => ({ id: s.id, label: `${s.title} (${s.slug})` }))}
              selected={(selected?.id && relationsByArticle[selected.id]?.caseStudyIds) || []}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="link_key">
              Link existing MDX
            </label>
            <Input
              placeholder="Quick filter..."
              value={mdxFilter}
              onChange={(e) => setMdxFilter(e.target.value)}
            />
            <div className="flex items-center gap-2 text-xs">
              <input
                id="unlinked_only"
                type="checkbox"
                checked={unlinkedOnly}
                onChange={(e) => setUnlinkedOnly(e.target.checked)}
              />
              <label htmlFor="unlinked_only">Show unlinked only</label>
            </div>
            <select
              id="link_key"
              name="link_key"
              defaultValue={
                selected?.body_path
                  ? (selected.body_path || "").replace(/^.*content\//, "").replace(/^\/+/, "")
                  : ""
              }
              size={8}
              className="border-input bg-background focus:ring-ring max-h-64 w-full overflow-auto rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="">— Select available document —</option>
              {availableDocs
                .filter((d) => d.key.startsWith("articles/"))
                .filter((d) => d.key.toLowerCase().includes(mdxFilter.toLowerCase()))
                .filter((d) =>
                  unlinkedOnly
                    ? !usedSet.has(d.key) || (selected?.body_path || "").includes(d.key) // keep current selection visible
                    : true,
                )
                .map((doc) => (
                  <option key={doc.id} value={doc.key}>
                    {doc.key}
                  </option>
                ))}
            </select>
            <p className="text-muted-foreground text-xs">Linking ignores the Content field.</p>
          </div>
          {/* Body path is derived by linking an MDX document; no need to show a separate field */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="mdx_content">
              Content (MDX)
            </label>
            <Textarea
              id="mdx_content"
              name="mdx_content"
              className="h-[30rem]"
              rows={18}
              placeholder={
                selected?.body_path
                  ? "Leave blank to keep existing MDX; paste to replace"
                  : "Write article body in MDX here"
              }
              onScroll={(event) => {
                const el = event.currentTarget;
                const preview = document.getElementById("article-mdx-preview");
                if (preview) {
                  const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
                  (preview as HTMLDivElement).scrollTop =
                    ratio *
                    ((preview as HTMLDivElement).scrollHeight -
                      (preview as HTMLDivElement).clientHeight);
                }
              }}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                On save, a doc will be created at articles/&lt;slug&gt;.mdx if not present, or
                updated if it exists.
              </p>
              <div className="flex gap-2">
                {selected?.body_path ? (
                  <button
                    type="button"
                    className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
                    onClick={async () => {
                      const key = (selected?.body_path || "").replace(/^.*content\//, "");
                      const res = await fetch(
                        `/api/admin/mdx-content?key=${encodeURIComponent(key)}`,
                      );
                      if (res.ok) {
                        const data = await res.json();
                        const textarea = document.getElementById(
                          "mdx_content",
                        ) as HTMLTextAreaElement | null;
                        if (textarea) textarea.value = data.content ?? "";
                      }
                    }}
                  >
                    Load current content
                  </button>
                ) : null}
                <button
                  type="button"
                  className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
                  onClick={async () => {
                    const textarea = document.getElementById(
                      "mdx_content",
                    ) as HTMLTextAreaElement | null;
                    const value = textarea?.value ?? "";
                    const res = await fetch("/api/admin/mdx-preview", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ source: value }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      const preview = document.getElementById("article-mdx-preview");
                      if (preview) (preview as HTMLDivElement).innerHTML = data.html;
                    }
                  }}
                >
                  Refresh preview
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div
              id="article-mdx-preview"
              className="text-muted-foreground h-[30rem] overflow-auto rounded-md border p-3 text-sm leading-6 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold"
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
        </form>
        <div className="flex items-center justify-between pt-3">
          {selected ? (
            <form
              action={deleteArticle}
              onSubmit={(e) => {
                if (!confirm("Delete this article? This cannot be undone.")) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="title" value={selected.title} />
              <input type="hidden" name="body_path" value={selected.body_path} />
              <Button variant="destructive" type="submit">
                Delete article
              </Button>
            </form>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
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
            <Button type="submit" form="article-form" onClick={() => setOpen(false)}>
              {selected ? "Save article" : "Create article"}
            </Button>
          </div>
        </div>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Bulk import</CardTitle>
          <CardDescription>Paste JSON exported above to import multiple articles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={importArticles} className="space-y-3">
            <textarea
              name="payload"
              rows={6}
              required
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              placeholder='[{"title":"Article","slug":"ai-security-blueprint","body_path":"articles/ai-security-blueprint.mdx"}]'
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
