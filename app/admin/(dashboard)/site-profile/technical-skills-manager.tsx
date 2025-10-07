"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileTechnicalSkill } from "@/lib/supabase/types";

import { deleteProfileTechnicalSkill, upsertProfileTechnicalSkill } from "./actions";

type Props = {
  skills: ProfileTechnicalSkill[];
  status?: string;
  detail?: string;
};

export function TechnicalSkillsManager({ skills, status, detail }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(
    () => skills.find((skill) => skill.id === selectedId) ?? null,
    [skills, selectedId],
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
            <CardTitle>Technical Skills Summary</CardTitle>
            <CardDescription>
              Add skill categories with comma-separated lists. Example: &quot;Security & Compliance:
              Microsoft Sentinel, Splunk, SentinelOne&quot;
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpen()}>
            Add skill category
          </Button>
        </div>
        {status === "tech-skill-saved" ? (
          <p className="text-sm text-emerald-600">Technical skill saved.</p>
        ) : status === "tech-skill-deleted" ? (
          <p className="text-sm text-emerald-600">
            Removed skill category {detail ? `"${detail}"` : ""}.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Skills</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <tr key={skill.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{skill.category}</td>
                    <td className="text-muted-foreground px-3 py-2">
                      {skill.skills.join(", ")}
                    </td>
                    <td className="px-3 py-2">{skill.order_index}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(skill.id)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-muted-foreground px-3 py-6 text-center">
                    No technical skills yet. Add categories to organize your technical expertise.
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
        title={selected ? "Edit skill category" : "Add skill category"}
      >
        <form
          id="tech-skill-form"
          key={selected?.id ?? "create"}
          action={upsertProfileTechnicalSkill}
          className="grid gap-3"
        >
          <input type="hidden" name="id" value={selected?.id ?? ""} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tech-skill-category">
              Category
            </label>
            <Input
              id="tech-skill-category"
              name="category"
              defaultValue={selected?.category ?? ""}
              placeholder="Security & Compliance"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tech-skill-skills">
              Skills (comma-separated)
            </label>
            <Textarea
              id="tech-skill-skills"
              name="skills"
              rows={3}
              defaultValue={selected?.skills.join(", ") ?? ""}
              placeholder="Microsoft Sentinel, Splunk, SentinelOne, Microsoft Defender"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tech-skill-order">
              Order index
            </label>
            <Input
              id="tech-skill-order"
              name="order_index"
              type="number"
              defaultValue={selected?.order_index ?? skills.length}
              min={0}
            />
          </div>
        </form>
        <div className="flex items-center justify-between gap-3 pt-4">
          {selected ? (
            <form
              action={deleteProfileTechnicalSkill}
              onSubmit={(event) => {
                if (!confirm("Delete this skill category?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="category" value={selected.category} />
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
            <Button type="submit" form="tech-skill-form">
              {selected ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
