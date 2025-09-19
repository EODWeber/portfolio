import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { NotificationSettings } from "@/lib/supabase/types";

async function loadSettings(): Promise<NotificationSettings | null> {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
        .from("notification_settings")
        .select("*")
        .eq("id", "singleton")
        .maybeSingle();
    return (data as NotificationSettings | null) ?? null;
}

async function log(channel: string, status: string, detail: string | null, payload: unknown) {
    try {
        const admin = createSupabaseAdminClient();
        await admin.from("notifications_log").insert({ channel, status, detail, payload });
    } catch (e) {
        console.error("Failed to log notification", e);
    }
}

function applyEmailTemplate(
    subject: string,
    innerHtml: string,
    settings: NotificationSettings | null,
) {
    const subj = settings?.email_subject_template
        ? settings.email_subject_template.replaceAll("{{subject}}", subject)
        : subject;
    const header = settings?.email_header_html ?? "";
    const footer = settings?.email_footer_html ?? "";
    return { subject: subj, html: `${header}${innerHtml}${footer}` };
}

async function sendEmail(subject: string, html: string, settings: NotificationSettings | null, replyTo?: string) {
    const emailEnabled = settings?.email_enabled ?? true; // default to true if not set
    const to = settings?.email_to || process.env.CONTACT_INBOX_EMAIL;
    const from = settings?.email_from || process.env.RESEND_FROM || process.env.CONTACT_FROM_EMAIL || "";
    const apiKey = process.env.RESEND_API_KEY;

    if (!emailEnabled) return;
    if (!to) {
        await log("email", "error", "Recipient address not configured (set Admin → Notifications email_to or CONTACT_INBOX_EMAIL).", {});
        return;
    }
    if (!from) {
        await log("email", "error", "From address not configured (set Admin → Notifications email_from or RESEND_FROM/CONTACT_FROM_EMAIL).", {});
        return;
    }
    if (!apiKey) {
        await log("email", "error", "RESEND_API_KEY is not configured.", {});
        return;
    }

    const templated = applyEmailTemplate(subject, html, settings);

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], subject: templated.subject, html: templated.html, reply_to: replyTo ? [replyTo] : undefined }),
    });
    if (!res.ok) {
        const bodyText = await res.text();
        console.error("Resend API error", bodyText);
        // Try to parse and add a friendly hint for domain unverified
        try {
            const parsed = JSON.parse(bodyText);
            if (parsed?.message && String(parsed.message).toLowerCase().includes("not verified")) {
                await log(
                    "email",
                    "error",
                    `${parsed.message} — Verify your domain in Resend and set a From on that domain.`,
                    { to, subject: templated.subject },
                );
                return;
            }
        } catch { }
        await log("email", "error", bodyText, { to, subject: templated.subject });
    } else {
        await log("email", "sent", null, { to, subject: templated.subject });
    }
}

async function sendTelegram(text: string, settings: NotificationSettings | null) {
    const enabled = settings?.telegram_enabled ?? false;
    const token = settings?.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
    if (!enabled || !token || !chatId) return;
    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "HTML" }),
        });
        const respText: string = await res.text();
        if (!res.ok) {
            console.error("Telegram send error", respText);
            await log("telegram", "error", respText, {});
        } else {
            await log("telegram", "sent", null, {});
        }
    } catch (err) {
        console.error("Telegram send exception", err);
        await log("telegram", "error", String(err), {});
    }
}

async function sendSlack(text: string, settings: NotificationSettings | null) {
    const enabled = settings?.slack_enabled ?? false;
    const webhook = settings?.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;
    if (!enabled || !webhook) return;
    try {
        const res = await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text }),
        });
        const respText: string = await res.text();
        if (!res.ok) {
            console.error("Slack webhook error", respText);
            await log("slack", "error", respText, {});
        } else {
            await log("slack", "sent", null, {});
        }
    } catch (err) {
        console.error("Slack webhook exception", err);
        await log("slack", "error", String(err), {});
    }
}

async function sendDiscord(content: string, settings: NotificationSettings | null) {
    const enabled = settings?.discord_enabled ?? false;
    const webhook = settings?.discord_webhook_url || process.env.DISCORD_WEBHOOK_URL;
    if (!enabled || !webhook) return;
    try {
        const res = await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        });
        const respText: string = await res.text();
        if (!res.ok) {
            console.error("Discord webhook error", respText);
            await log("discord", "error", respText, {});
        } else {
            await log("discord", "sent", null, {});
        }
    } catch (err) {
        console.error("Discord webhook exception", err);
        await log("discord", "error", String(err), {});
    }
}

export async function notifyNewContact(payload: {
    name: string;
    email: string;
    company?: string | null;
    message: string;
}) {
    const settings = await loadSettings();
    const subject = `New contact request: ${payload.name}`;
    const html = `<p><strong>Name:</strong> ${payload.name}</p>
<p><strong>Email:</strong> ${payload.email}</p>
<p><strong>Company:</strong> ${payload.company ?? "-"}</p>
<p><strong>Message:</strong><br/>${payload.message.replace(/\n/g, "<br/>")}</p>`;
    const text = `New contact request\nName: ${payload.name}\nEmail: ${payload.email}\nCompany: ${payload.company ?? "-"}\nMessage: ${payload.message}`;

    await Promise.allSettled([
        sendEmail(subject, html, settings, payload.email),
        sendTelegram(text, settings),
        sendSlack(text, settings),
        sendDiscord(text, settings),
    ]);
}

export async function sendTestNotification() {
    const settings = await loadSettings();
    const subject = "Test notification";
    const html = `<p>This is a test notification from the admin portal.</p>`;
    const text = `This is a test notification from the admin portal.`;
    await Promise.allSettled([
        sendEmail(subject, html, settings),
        sendTelegram(text, settings),
        sendSlack(text, settings),
        sendDiscord(text, settings),
    ]);
}
