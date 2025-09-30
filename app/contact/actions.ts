"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { logEvent } from "@/lib/analytics/log-event";
import { contactSchema } from "@/app/contact/schema";
import { notifyNewContact } from "@/lib/notifications/send";
// Using Resend via REST to avoid bundling optional peer '@react-email/render'

export type ContactFormState = {
  success?: boolean;
  error?: string;
  values?: {
    name: string;
    email: string;
    company?: string;
    message: string;
  };
};

export async function submitContact(
  _: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    company: formData.get("company")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
  };
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((issue) => issue.message).join("\n"),
      values: raw,
    };
  }

  // Validate Turnstile token
  const turnstileToken = formData.get("cf-turnstile-token")?.toString();
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const turnstileDisabled =
    process.env.NODE_ENV === "development" ||
    process.env.TURNSTILE_DISABLED === "true" ||
    process.env.TURNSTILE_DISABLED === "1";
  if (secretKey && !turnstileDisabled) {
    if (!turnstileToken) {
      return { success: false, error: "Please complete the captcha challenge", values: raw };
    }
    try {
      const body = new URLSearchParams();
      body.append("secret", secretKey);
      body.append("response", turnstileToken);
      // Optionally include remoteip if available: body.append("remoteip", ip)
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = (await res.json()) as { success: boolean; [k: string]: unknown };
      if (!result.success) {
        console.error("Turnstile verification failed", { result });
        return { success: false, error: "Captcha verification failed", values: raw };
      }
    } catch (err) {
      console.error("Turnstile verification error", err);
      return { success: false, error: "Captcha verification error", values: raw };
    }
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("contact_requests").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company,
    message: parsed.data.message,
    origin: "web",
  });

  if (error) {
    return { success: false, error: error.message, values: parsed.data };
  }

  await logEvent("contact_request_received", {
    email: parsed.data.email,
    company: parsed.data.company,
  });

  // Notifications (email + message services)
  await notifyNewContact({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company,
    message: parsed.data.message,
  });

  revalidatePath("/contact");
  return { success: true };
}
