"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

const sectionSchema = z.enum(["email", "telegram", "slack", "discord", "test"]);
import { sendTestNotification } from "@/lib/notifications/send";

export async function saveNotificationSettings(formData: FormData) {
  await requireAdminUser();
  const section = sectionSchema.parse(formData.get("section"));
  const admin = createSupabaseAdminClient();

  const base: Record<string, unknown> = {};

  if (section === "test") {
    // Fire a test notification using current settings
    await sendTestNotification();
    revalidatePath("/admin/notifications");
    redirect("/admin/notifications");
    return;
  }

  if (section === "email") {
    base.email_enabled = formData.get("email_enabled") === "on";
    base.email_to = formData.get("email_to")?.toString() ?? null;
    base.email_from = formData.get("email_from")?.toString() ?? null;
  }
  if (section === "telegram") {
    base.telegram_enabled = formData.get("telegram_enabled") === "on";
    base.telegram_bot_token = formData.get("telegram_bot_token")?.toString() ?? null;
    base.telegram_chat_id = formData.get("telegram_chat_id")?.toString() ?? null;
  }
  if (section === "slack") {
    base.slack_enabled = formData.get("slack_enabled") === "on";
    base.slack_webhook_url = formData.get("slack_webhook_url")?.toString() ?? null;
  }
  if (section === "discord") {
    base.discord_enabled = formData.get("discord_enabled") === "on";
    base.discord_webhook_url = formData.get("discord_webhook_url")?.toString() ?? null;
  }

  const { error } = await admin.from("notification_settings").upsert({ id: "singleton", ...base });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/notifications");
  redirect("/admin/notifications");
}
