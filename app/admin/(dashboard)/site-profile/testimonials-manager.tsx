"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileTestimonial } from "@/lib/supabase/types";

import { deleteProfileTestimonial, upsertProfileTestimonial } from "./actions";

type Props = {
  testimonials: ProfileTestimonial[];
  status?: string;
  detail?: string;
};

export function TestimonialsManager({ testimonials, status, detail }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(
    () => testimonials.find((item) => item.id === selectedId) ?? null,
    [testimonials, selectedId],
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
            <CardTitle>Testimonials</CardTitle>
            <CardDescription>Quotes from clients or peers that deliver social proof.</CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpen()}>
            Add testimonial
          </Button>
        </div>
        {status === "testimonial-saved" ? (
          <p className="text-sm text-emerald-600">Testimonial saved.</p>
        ) : status === "testimonial-deleted" ? (
          <p className="text-sm text-emerald-600">Removed testimonial {detail ? `“${detail}”` : ""}.</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="px-3 py-2">Quote</th>
                <th className="px-3 py-2">Attribution</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length > 0 ? (
                testimonials.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{item.quote}</td>
                    <td className="px-3 py-2 font-medium">{item.attribution}</td>
                    <td className="px-3 py-2">{item.role ?? "—"}</td>
                    <td className="px-3 py-2 break-all">{item.link_url ?? "—"}</td>
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
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No testimonials yet. Add 2–3 concise quotes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal open={open} onClose={handleClose} title={selected ? "Edit testimonial" : "Add testimonial"}>
        <form id="testimonial-form" key={selected?.id ?? "create"} action={upsertProfileTestimonial} className="grid gap-3">
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="testimonial-quote">
              Quote
            </label>
            <Textarea
              id="testimonial-quote"
              name="quote"
              rows={3}
              defaultValue={selected?.quote ?? ""}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="testimonial-attribution">
                Attribution
              </label>
              <Input
                id="testimonial-attribution"
                name="attribution"
                defaultValue={selected?.attribution ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="testimonial-role">
                Role / title
              </label>
              <Input id="testimonial-role" name="role" defaultValue={selected?.role ?? ""} placeholder="Security Lead" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="testimonial-link">
              Link URL
            </label>
            <Input
              id="testimonial-link"
              name="link_url"
              defaultValue={selected?.link_url ?? ""}
              placeholder="https://www.linkedin.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="testimonial-order">
              Order index
            </label>
            <Input
              id="testimonial-order"
              name="order_index"
              type="number"
              defaultValue={selected?.order_index ?? testimonials.length}
              min={0}
            />
          </div>
        </form>
        <div className="flex items-center justify-between gap-3 pt-4">
          {selected ? (
            <form
              action={deleteProfileTestimonial}
              onSubmit={(event) => {
                if (!confirm("Delete this testimonial?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="attribution" value={selected.attribution} />
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
            <Button type="submit" form="testimonial-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
