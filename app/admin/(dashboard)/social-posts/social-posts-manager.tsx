"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/admin/modal";
import type { SocialPost } from "@/lib/supabase/types";

import { deleteSocialPost, toggleSocialPostFeatured, upsertSocialPost } from "./actions";
import { Modal } from "@/components/admin/modal";

type SortKey = "title" | "platform" | "posted" | "featured" | "updated";
type SortDirection = "asc" | "desc";

function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const FORM_GRID = "grid gap-3 md:grid-cols-2";

export function SocialPostsManager({ posts, status }: { posts: SocialPost[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => posts.find((post) => post.id === selectedId) ?? null, [posts, selectedId]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) =>
      [post.title, post.platform, post.summary ?? "", post.url]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [posts, query]);

  const handleOpen = (id?: string) => {
    setSelectedId(id ?? "");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId("");
  };

  const platforms = useMemo(() => Array.from(new Set(posts.map((post) => post.platform))).sort(), [posts]);

  const list = useMemo(() => {
    const filtered = posts
      .filter((post) =>
        query
          ? [post.title, post.platform, post.summary ?? "", post.url]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
          : true,
      )
      .filter((post) => (platformFilter === "all" ? true : post.platform === platformFilter));

    const direction = sort.direction === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sort.key) {
        case "title":
          return a.title.localeCompare(b.title) * direction;
        case "platform":
          return a.platform.localeCompare(b.platform) * direction;
        case "posted":
          return (new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime()) * direction;
        case "featured":
          if (a.featured === b.featured) return 0;
          return (a.featured ? -1 : 1) * direction;
        case "updated":
          return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * direction;
        default:
          return 0;
      }
    });
  }, [posts, query, platformFilter, sort]);

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
            <h1 className="text-3xl font-semibold">Social feed</h1>
            <p className="text-muted-foreground text-sm">
              Manage the external signals that populate the feed and homepage highlights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search title, platform, url..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64"
            />
            <Button size="sm" onClick={() => handleOpen()}>
              Add post
            </Button>
          </div>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Social post saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Social post deleted.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>Filter by platform or title and edit posts inline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Platform</th>
                  <th className="px-3 py-2">Posted</th>
                  <th className="px-3 py-2">Featured</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr key={post.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{post.title}</td>
                    <td className="px-3 py-2">{post.platform}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(post.posted_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{post.featured ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(post.id)}>
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

      <Modal open={open} onClose={handleClose} title={selected ? "Edit post" : "Add post"}>
        <form key={selected?.id ?? "create"} action={upsertSocialPost} className={FORM_GRID}>
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="platform">
              Platform
            </label>
            <Input id="platform" name="platform" defaultValue={selected?.platform ?? ""} list="platforms" required />
            <datalist id="platforms">
              <option value="GitHub" />
              <option value="X" />
              <option value="Twitter" />
              <option value="LinkedIn" />
              <option value="YouTube" />
              <option value="Blog" />
              <option value="Dev.to" />
              <option value="Medium" />
            </datalist>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <Input id="title" name="title" defaultValue={selected?.title ?? ""} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="url">
              URL
            </label>
            <Input id="url" name="url" defaultValue={selected?.url ?? ""} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="summary">
              Summary
            </label>
            <Textarea id="summary" name="summary" defaultValue={selected?.summary ?? ""} rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="posted_at">
              Posted at
            </label>
            <Input
              id="posted_at"
              name="posted_at"
              type="datetime-local"
              defaultValue={selected ? toDatetimeLocal(selected.posted_at) : ""}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="featured" name="featured" type="checkbox" defaultChecked={selected?.featured ?? false} />
            <label className="text-sm font-medium" htmlFor="featured">
              Featured (max 6)
            </label>
          </div>
          <div className="flex items-center justify-between gap-2 md:col-span-2">
            {selected ? (
              <form
                action={deleteSocialPost}
                onSubmit={(event) => {
                  if (!confirm("Delete this social post?")) event.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={selected.id} />
                <Button variant="destructive" type="submit">
                  Delete post
                </Button>
              </form>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">{selected ? "Save post" : "Create post"}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
