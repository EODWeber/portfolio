"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Article, MdxDocument } from "@/lib/supabase/types";

import { deleteArticle, upsertArticle, importArticles } from "./actions";
import { Modal } from "@/components/admin/modal";

const FORM_GRID = "grid gap-3 md:grid-cols-2";

export function ArticleManager({
  articles,
  availableDocs,
  status,
}: {
  articles: Article[];
  availableDocs: MdxDocument[];
  status?: string;
}) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [mdxFilter, setMdxFilter] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => articles.find((article) => article.id === selectedId),
    [articles, selectedId],
  );

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
              className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Button size="sm" onClick={() => { setSelectedId(""); setOpen(true); }}>Add article</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={async () => {
            try {
              await navigator.clipboard.writeText(JSON.stringify(articles, null, 2));
            } catch (error) {
              console.error("Unable to copy article export", error);
            }
          }}>
            Copy JSON export
          </Button>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Article saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Article deleted.</p>
        ) : status === "imported" ? (
          <p className="text-sm text-emerald-600">Articles imported.</p>
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
              <thead className="sticky top-0 bg-muted/40">
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
                        <Button size="sm" variant="outline" onClick={() => { setSelectedId(a.id); setOpen(true); }}>Edit</Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={selected ? "Edit article" : "Add article"}>
        <form key={selected?.id ?? "create"} action={upsertArticle} className={FORM_GRID}>
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
              <label className="text-sm font-medium" htmlFor="tags">
                Tags (comma separated)
              </label>
              <Input
                id="tags"
                name="tags"
                defaultValue={selected ? selected.tags.join(", ") : ""}
              />
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
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="body_path">
                Body path (managed)
              </label>
              <Input id="body_path" name="body_path" defaultValue={selected?.body_path ?? ""} readOnly disabled />
              <p className="text-xs text-muted-foreground">Set automatically when creating or linking an MDX document.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="mdx_content">Content (MDX)</label>
              <Textarea id="mdx_content" name="mdx_content" rows={10} placeholder={selected?.body_path ? "Leave blank to keep existing MDX; paste to replace" : "Write article body in MDX here"} />
              <p className="text-xs text-muted-foreground">On save, a doc will be created at articles/&lt;slug&gt;.mdx if not present, or updated if it exists.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="link_key">Link existing MDX</label>
              <Input
                placeholder="Quick filter..."
                value={mdxFilter}
                onChange={(e) => setMdxFilter(e.target.value)}
              />
              <select id="link_key" name="link_key" defaultValue="" className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2">
                <option value="">— Select available document —</option>
                {availableDocs.filter((d) => d.key.toLowerCase().includes(mdxFilter.toLowerCase())).map((doc) => (
                  <option key={doc.id} value={doc.key}>{doc.key}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Only unlinked documents are listed. Linking ignores the Content field.</p>
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
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => { setSelectedId(""); setOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" onClick={() => setOpen(false)}>{selected ? "Save article" : "Create article"}</Button>
            </div>
          </form>
          {selected ? (
            <form
              action={deleteArticle}
              className="flex justify-between pt-3"
              onSubmit={(e) => {
                if (!confirm("Delete this article? This cannot be undone.")) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <Button variant="destructive" type="submit">Delete article</Button>
              <div />
            </form>
          ) : null}
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
