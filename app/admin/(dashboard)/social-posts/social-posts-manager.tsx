"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SocialPost } from "@/lib/supabase/types";

import { deleteSocialPost, upsertSocialPost } from "./actions";

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

export function SocialPostsManager({ posts, status }: { posts: SocialPost[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(() => posts.find((post) => post.id === selectedId), [posts, selectedId]);

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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-medium" htmlFor="social-post-selector">
              Select post
            </label>
            <select
              id="social-post-selector"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="border-input bg-background focus:ring-ring w-64 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="">Create new post…</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
            </select>
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
          <CardTitle>{selected ? "Edit post" : "Add post"}</CardTitle>
          <CardDescription>Supports LinkedIn, GitHub, talks, or any public URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            key={selected?.id ?? "create"}
            action={upsertSocialPost}
            className="grid gap-3 md:grid-cols-2"
          >
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
              <Textarea
                id="summary"
                name="summary"
                defaultValue={selected?.summary ?? ""}
                rows={3}
              />
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
              <input
                id="featured"
                name="featured"
                type="checkbox"
                defaultChecked={selected?.featured ?? false}
              />
              <label className="text-sm font-medium" htmlFor="featured">
                Featured
              </label>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              {selected ? (
                <Button type="button" variant="outline" onClick={() => setSelectedId("")}>
                  Clear selection
                </Button>
              ) : null}
              <Button type="submit">{selected ? "Save post" : "Create post"}</Button>
            </div>
          </form>
          {selected ? (
            <form action={deleteSocialPost} className="flex justify-end">
              <input type="hidden" name="id" value={selected.id} />
              <Button variant="destructive" type="submit">
                Delete post
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
