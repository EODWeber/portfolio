"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { ContactRequestStatus } from "@/lib/supabase/types";

const statusEnum = z.enum(["new", "in-review", "replied", "archived"]);

const updateSchema = z.object({
  id: z.string().uuid({ message: "Missing request id" }),
  status: statusEnum,
});

export async function updateContactRequestStatus(formData: FormData): Promise<void> {
  await requireAdminUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id")?.toString(),
    status: formData.get("status")?.toString(),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join("\n"));
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("contact_requests")
    .update({ status: parsed.data.status as ContactRequestStatus })
    .eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/contact-requests");
  redirect("/admin/contact-requests?status=success");
}

const deleteSchema = z.object({
  id: z.string().uuid({ message: "Missing request id" }),
});

export async function deleteContactRequest(formData: FormData): Promise<void> {
  await requireAdminUser();

  const parsed = deleteSchema.safeParse({ id: formData.get("id")?.toString() });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join("\n"));
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contact_requests").delete().eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/contact-requests");
  redirect("/admin/contact-requests?status=deleted");
}
