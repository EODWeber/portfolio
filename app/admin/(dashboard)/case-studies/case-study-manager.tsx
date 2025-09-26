"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { RelatedChecklist } from "@/app/admin/_components/related-checklist";
import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Article, CaseStudy, MdxDocument, Project } from "@/lib/supabase/types";
import { caseStudyMetricsEntries, metricsToTextareaValue } from "@/lib/case-studies/metrics";

import { deleteCaseStudy, importCaseStudies, upsertCaseStudy } from "./actions";

const FORM_GRID = "grid gap-3 md:grid-cols-2";
const VERTICAL_OPTIONS = ["ai-security", "secure-devops", "soc"] as const;
const METRICS_PLACEHOLDER = `{
  "1": {
    "title": "Deployment Frequency",
    "description": "Shipped weekly across 12 squads"
  },
  "2": {
    "title": "Remediation Coverage",
    "description": "Automated 87% of repeatable controls"
  },
  "3": {
    "title": "Customer Satisfaction",
    "description": "NPS increased to 68 post-launch"
  }
}`;

type CaseStudyManagerProps = {
  caseStudies: CaseStudy[];
  availableDocs: MdxDocument[];
  projects: Project[];
  articles: Article[];
  relatedProjectIdsByCaseStudy: Record<string, string[]>;
  relatedArticleIdsByCaseStudy: Record<string, string[]>;
  status?: string;
  usedKeys?: string[];
};

export function CaseStudyManager({
  caseStudies,
  availableDocs,
  projects,
  articles,
  relatedProjectIdsByCaseStudy,
  relatedArticleIdsByCaseStudy,
  status,
  usedKeys = [],
}: CaseStudyManagerProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [mdxFilter, setMdxFilter] = useState("");
  const [unlinkedOnly, setUnlinkedOnly] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [mdxContent, setMdxContent] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => caseStudies.find((study) => study.id === selectedId) ?? null,
    [caseStudies, selectedId],
  );
  const usedSet = useMemo(() => new Set(usedKeys), [usedKeys]);
  const selectedMetricEntries = useMemo(
    () => caseStudyMetricsEntries(selected?.metrics),
    [selected?.metrics],
  );

  const fetchPreview = useCallback(async (source: string) => {
    if (!source) {
      setPreviewHtml("");
      return;
    }
    try {
      const res = await fetch("/api/admin/mdx-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html ?? "");
      }
    } catch (error) {
      console.error("Unable to refresh preview", error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (!open) {
      setMdxContent("");
      setPreviewHtml("");
      setMdxFilter("");
      setUnlinkedOnly(false);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      if (!selected?.body_path) {
        if (active) {
          setMdxContent("");
          setPreviewHtml("");
        }
        return;
      }

      const keyCandidate = toContentKey(selected.body_path);
      if (!keyCandidate) {
        if (active) {
          setMdxContent("");
          setPreviewHtml("");
        }
        return;
      }

      try {
        const res = await fetch(`/api/admin/mdx-content?key=${encodeURIComponent(keyCandidate)}`);
        if (!res.ok) {
          if (active) {
            setMdxContent("");
            setPreviewHtml("");
          }
          return;
        }
        const data = await res.json();
        if (!active) return;
        const content = data.content ?? "";
        setMdxContent(content);
        await fetchPreview(content);
      } catch (error) {
        console.error("Unable to load MDX content", error);
        if (active) {
          setMdxContent("");
          setPreviewHtml("");
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [fetchPreview, open, selected?.body_path]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return caseStudies;
    return caseStudies.filter((study) =>
      [study.title, study.slug, study.vertical, study.summary]
        .concat(study.tags ?? [])
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [caseStudies, query]);

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(caseStudies, null, 2));
    } catch (error) {
      console.error("Unable to copy case study export", error);
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

  const selectedProjectIds = selected?.id ? (relatedProjectIdsByCaseStudy[selected.id] ?? []) : [];
  const selectedArticleIds = selected?.id ? (relatedArticleIdsByCaseStudy[selected.id] ?? []) : [];
  const defaultLinkKey = selected?.body_path ? toContentKey(selected.body_path) : "";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Case studies</h1>
            <p className="text-muted-foreground text-sm">
              Manage narratives that power the case studies section and related cross-links.
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
              Add case study
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyExport}>
            Copy JSON export
          </Button>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Case study saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Case study deleted.</p>
        ) : status === "imported" ? (
          <p className="text-sm text-emerald-600">Case studies imported.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Case studies</CardTitle>
          <CardDescription>
            Filter to find a study, then edit its metadata and linked MDX.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 sticky top-0">
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
                {filtered.map((study) => (
                  <tr key={study.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{study.title}</td>
                    <td className="px-3 py-2">{study.slug}</td>
                    <td className="px-3 py-2">{study.vertical}</td>
                    <td className="px-3 py-2 capitalize">{study.status}</td>
                    <td className="px-3 py-2">{study.featured ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(study.id)}>
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
        onClose={handleClose}
        title={selected ? "Edit case study" : "Add case study"}
      >
        <form
          id="case-study-form"
          key={selected?.id ?? "create"}
          action={upsertCaseStudy}
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
              {VERTICAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
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
            <label className="text-sm font-medium" htmlFor="hero_url">
              Hero image URL
            </label>
            <Input id="hero_url" name="hero_url" defaultValue={selected?.hero_url ?? ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="body_path">
              Body path (managed)
            </label>
            <Input
              id="body_path"
              name="body_path"
              defaultValue={selected?.body_path ?? ""}
              readOnly
              disabled
            />
            <p className="text-muted-foreground text-xs">
              Set automatically when creating or linking an MDX document.
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="link_key">
              Link existing MDX
            </label>
            <Input
              placeholder="Quick filter..."
              value={mdxFilter}
              onChange={(event) => setMdxFilter(event.target.value)}
            />
            <div className="flex items-center gap-2 text-xs">
              <input
                id="unlinked_only"
                type="checkbox"
                checked={unlinkedOnly}
                onChange={(event) => setUnlinkedOnly(event.target.checked)}
              />
              <label htmlFor="unlinked_only">Show unlinked only</label>
            </div>
            <select
              id="link_key"
              name="link_key"
              defaultValue={defaultLinkKey ?? ""}
              size={8}
              className="border-input bg-background focus:ring-ring max-h-64 w-full overflow-auto rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="">— Select available document —</option>
              {availableDocs
                .filter((doc) => doc.key.startsWith("case-studies/"))
                .filter((doc) => doc.key.toLowerCase().includes(mdxFilter.toLowerCase()))
                .filter((doc) =>
                  unlinkedOnly
                    ? !usedSet.has(doc.key) || (!!defaultLinkKey && doc.key === defaultLinkKey)
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
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="mdx_content">
              Content (MDX)
            </label>
            <Textarea
              id="mdx_content"
              name="mdx_content"
              value={mdxContent}
              onChange={(event) => setMdxContent(event.target.value)}
              className="h-[28rem]"
              rows={18}
              placeholder={
                selected?.body_path
                  ? "Leave blank to keep existing MDX; paste to replace"
                  : "Write case study in MDX here"
              }
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
                onClick={() => fetchPreview(mdxContent)}
              >
                Refresh preview
              </button>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Preview</label>
            <div
              id="case-study-mdx-preview"
              className="text-muted-foreground h-[28rem] overflow-auto rounded-md border p-3 text-sm leading-6 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="metrics">
              Metrics (JSON object with title and description per key)
            </label>
            <Textarea
              id="metrics"
              name="metrics"
              defaultValue={formatMetrics(selected ?? undefined)}
              rows={6}
              placeholder={METRICS_PLACEHOLDER}
            />
            <p className="text-muted-foreground text-xs">
              Provide stable keys (e.g., <code>1</code>, <code>deployment_frequency</code>) and
              supply a title and description for each metric.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="featured_metric">
              Featured metric (required when featured)
            </label>
            <select
              id="featured_metric"
              name="featured_metric"
              defaultValue={
                (selected as unknown as { featured_metric?: string | null })?.featured_metric ?? ""
              }
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="">— Select featured metric —</option>
              {selectedMetricEntries.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.title}
                </option>
              ))}
            </select>
            {selectedMetricEntries.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                Add metrics above to enable selecting a featured metric.
              </p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Related projects</label>
            <RelatedChecklist
              name="related_project_ids"
              items={projects.map((project) => ({
                id: project.id,
                label: `${project.title} (${project.slug})`,
              }))}
              selected={selectedProjectIds}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Related articles</label>
            <RelatedChecklist
              name="related_article_ids"
              items={articles.map((article) => ({
                id: article.id,
                label: `${article.title} (${article.slug})`,
              }))}
              selected={selectedArticleIds}
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
              Featured (max 3)
            </label>
          </div>
        </form>
        <div className="flex items-center justify-between gap-2 pt-3">
          {selected ? (
            <form
              action={deleteCaseStudy}
              onSubmit={(event) => {
                if (!confirm("Delete this case study?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="label" value={selected.title} />
              <input type="hidden" name="body_path" value={selected.body_path ?? ""} />
              <Button variant="destructive" type="submit">
                Delete case study
              </Button>
            </form>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form="case-study-form">
              {selected ? "Save case study" : "Create case study"}
            </Button>
          </div>
        </div>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Bulk import</CardTitle>
          <CardDescription>
            Paste JSON exported above to insert or update multiple records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={importCaseStudies} className="space-y-3">
            <textarea
              name="payload"
              rows={6}
              required
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              placeholder='[{"title":"Case Study","slug":"zero-downtime-delivery","summary":"..."}]'
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

function toContentKey(path?: string | null) {
  if (!path) return "";
  return path.replace(/^.*content\//, "").replace(/^\/+/, "");
}

function formatMetrics(study: CaseStudy | null | undefined) {
  return metricsToTextareaValue(study?.metrics);
}
