"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileRecognition } from "@/lib/supabase/types";

import { deleteProfileRecognition, upsertProfileRecognition } from "./actions";

type Props = {
  recognitions: ProfileRecognition[];
  status?: string;
  detail?: string;
};

export function RecognitionManager({ recognitions, status, detail }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(
    () => recognitions.find((item) => item.id === selectedId) ?? null,
    [recognitions, selectedId],
  );

  const handleOpen = (id?: string) => {
    setSelectedId(id ?? "");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Recognition</CardTitle>
            <CardDescription>
              Certifications, awards, and features that add third-party credibility.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpen()}>
            Add recognition
          </Button>
        </div>
        {status === "recognition-saved" ? (
          <p className="text-sm text-emerald-600">Recognition saved.</p>
        ) : status === "recognition-deleted" ? (
          <p className="text-sm text-emerald-600">
            Removed {detail ? `“${detail}”` : "recognition"}.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Issuer</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recognitions.length > 0 ? (
                recognitions.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{item.title}</td>
                    <td className="text-muted-foreground px-3 py-2">{item.issuer ?? "—"}</td>
                    <td className="px-3 py-2">{item.year ?? "—"}</td>
                    <td className="break-all px-3 py-2">{item.link_url ?? "—"}</td>
                    <td className="px-3 py-2">{item.order_index}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(item.id)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-3 py-6 text-center">
                    No recognition entries yet. Add 2–4 credentials or awards.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal
        open={open}
        onClose={handleClose}
        title={selected ? "Edit recognition" : "Add recognition"}
      >
        <form
          id="recognition-form"
          key={selected?.id ?? "create"}
          action={upsertProfileRecognition}
          className="grid gap-3"
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="recognition-title">
              Title
            </label>
            <Input
              id="recognition-title"
              name="title"
              defaultValue={selected?.title ?? ""}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="recognition-issuer">
                Issuer
              </label>
              <Input
                id="recognition-issuer"
                name="issuer"
                defaultValue={selected?.issuer ?? ""}
                placeholder="ISC²"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="recognition-year">
                Year
              </label>
              <Input
                id="recognition-year"
                name="year"
                defaultValue={selected?.year ?? ""}
                placeholder="2024"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="recognition-link">
              Link URL
            </label>
            <Input
              id="recognition-link"
              name="link_url"
              defaultValue={selected?.link_url ?? ""}
              placeholder="https://example.com/credential"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="recognition-order">
              Order index
            </label>
            <Input
              id="recognition-order"
              name="order_index"
              type="number"
              defaultValue={selected?.order_index ?? recognitions.length}
              min={0}
            />
          </div>
        </form>
        <div className="flex items-center justify-between gap-3 pt-4">
          {selected ? (
            <form
              action={deleteProfileRecognition}
              onSubmit={(event) => {
                if (!confirm("Delete this recognition?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="title" value={selected.title} />
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form="recognition-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
