"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ContactLink } from "@/lib/supabase/types";

import { deleteContactLink, upsertContactLink } from "./actions";

export function ContactLinksManager({ links, status }: { links: ContactLink[]; status?: string }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(() => links.find((link) => link.id === selectedId), [links, selectedId]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Contact links</h1>
            <p className="text-muted-foreground text-sm">
              Manage the destinations surfaced on the public contact page.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-medium" htmlFor="contact-link-selector">
              Select link
            </label>
            <select
              id="contact-link-selector"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="border-input bg-background focus:ring-ring w-64 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <option value="">Create new link…</option>
              {links.map((link) => (
                <option key={link.id} value={link.id}>
                  {link.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {status === "success" ? (
          <p className="text-sm text-emerald-600">Contact link saved.</p>
        ) : status === "deleted" ? (
          <p className="text-sm text-emerald-600">Contact link deleted.</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{selected ? "Edit contact link" : "Add contact link"}</CardTitle>
          <CardDescription>Links are ordered by the `order_index` ascending.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            key={selected?.id ?? "create"}
            action={upsertContactLink}
            className="grid gap-3 md:grid-cols-2"
          >
            <input type="hidden" name="id" value={selected?.id ?? ""} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="label">
                Label
              </label>
              <Input id="label" name="label" defaultValue={selected?.label ?? ""} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="url">
                URL / mailto
              </label>
              <Input id="url" name="url" defaultValue={selected?.url ?? ""} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category">
                Category
              </label>
              <Input
                id="category"
                name="category"
                defaultValue={selected?.category ?? ""}
                placeholder="primary, social, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="icon">
                Icon
              </label>
              <Input
                id="icon"
                name="icon"
                defaultValue={selected?.icon ?? ""}
                placeholder="github, linkedin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="order_index">
                Order index
              </label>
              <Input
                id="order_index"
                name="order_index"
                type="number"
                defaultValue={selected?.order_index ?? links.length}
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              {selected ? (
                <Button type="button" variant="outline" onClick={() => setSelectedId("")}>
                  Clear selection
                </Button>
              ) : null}
              <Button type="submit">{selected ? "Save link" : "Create link"}</Button>
            </div>
          </form>
          {selected ? (
            <form action={deleteContactLink} className="flex justify-end">
              <input type="hidden" name="id" value={selected.id} />
              <Button variant="destructive" type="submit">
                Delete contact link
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
