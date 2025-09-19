"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CaseStudy, MdxDocument } from "@/lib/supabase/types";

import { deleteCaseStudy, importCaseStudies, upsertCaseStudy } from "./actions";

const FORM_GRID = "grid gap-3 md:grid-cols-2";

export function CaseStudyManager({
  caseStudies,
  availableDocs,
  status,
}: {
  caseStudies: CaseStudy[];
  availableDocs: MdxDocument[];
  status?: string;
}) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [mdxFilter, setMdxFilter] = useState("");
  const selected = useMemo(
    () => caseStudies.find((study) => study.id === selectedId),
    [caseStudies, selectedId],
  );

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(caseStudies, null, 2));
    } catch (error) {
      console.error("Unable to copy case study export", error);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Case studies</h1>
            <p className="text-muted-foreground text-sm">
              Manage long-form narratives that power the case studies section and related project
              cross-links.
            </p>
          </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-medium" htmlFor="case-study-selector">
            Select existing study
          </label>
          <select
              id="case-study-selector"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="border-input bg-background focus:ring-ring w-64 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="">Create new case study…</option>
              {caseStudies.map((study) => (
                <option key={study.id} value={study.id}>
                  {study.title}
                </option>
              ))}
            </select>
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
          <CardTitle>{selected ? "Edit case study" : "Add case study"}</CardTitle>
          <CardDescription>Manage metadata and content body below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form key={selected?.id ?? "create"} action={upsertCaseStudy} className={FORM_GRID}>
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
              <label className="text-sm font-medium" htmlFor="hero_url">
                Hero image URL
              </label>
              <Input id="hero_url" name="hero_url" defaultValue={selected?.hero_url ?? ""} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="body_path">Body path (managed)</label>
              <Input id="body_path" name="body_path" defaultValue={selected?.body_path ?? ""} readOnly disabled />
              <p className="text-xs text-muted-foreground">Set automatically when creating or linking an MDX document.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="mdx_content">Content (MDX)</label>
              <Textarea id="mdx_content" name="mdx_content" rows={10} placeholder={selected?.body_path ? "Leave blank to keep existing MDX; paste to replace" : "Write case study in MDX here"} />
              <p className="text-xs text-muted-foreground">On save, a doc will be created at case-studies/&lt;slug&gt;.mdx if not present, or updated if it exists.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="link_key">Link existing MDX</label>
              <Input placeholder="Quick filter..." value={mdxFilter} onChange={(e) => setMdxFilter(e.target.value)} />
              <select id="link_key" name="link_key" defaultValue="" className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2">
                <option value="">— Select available document —</option>
                {availableDocs.filter((d) => d.key.toLowerCase().includes(mdxFilter.toLowerCase())).map((doc) => (
                  <option key={doc.id} value={doc.key}>{doc.key}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Only unlinked documents are listed. Linking ignores the Content field.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="metrics">
                Metrics (one per line: Metric|Value)
              </label>
              <Textarea
                id="metrics"
                name="metrics"
                defaultValue={formatMetrics(selected)}
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
            <div className="flex items-center gap-2 md:col-span-2">
              <input id="featured" name="featured" type="checkbox" defaultChecked={selected?.featured ?? false} />
              <label htmlFor="featured" className="text-sm font-medium">Featured (max 6)</label>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              {selected ? (
                <Button type="button" variant="outline" onClick={() => setSelectedId("")}>
                  Clear selection
                </Button>
              ) : null}
              <Button type="submit">{selected ? "Save case study" : "Create case study"}</Button>
            </div>
          </form>
          {selected ? (
            <form action={deleteCaseStudy} className="flex justify-end">
              <input type="hidden" name="id" value={selected.id} />
              <Button variant="destructive" type="submit">
                Delete case study
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk import</CardTitle>
          <CardDescription>Paste JSON exported above to insert or update multiple records.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={importCaseStudies} className="space-y-3">
            <textarea
              name="payload"
              rows={6}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

function formatMetrics(study: CaseStudy | undefined) {
  if (!study?.metrics) return "";
  return Object.entries(study.metrics)
    .map(([metric, value]) => `${metric}|${value}`)
    .join("\n");
}
