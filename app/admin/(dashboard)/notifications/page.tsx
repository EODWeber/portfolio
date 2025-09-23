import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getNotificationSettings, getNotificationsLog } from "@/lib/admin/queries";

import { saveNotificationSettings } from "@/app/admin/(dashboard)/notifications/actions";
import { RecentNotifications } from "./recent-notifications";

export default async function NotificationsSettingsPage() {
  const [settings, log] = await Promise.all([getNotificationSettings(), getNotificationsLog(20)]);
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Configure email and message service notifications for inbound contact requests.
        </p>
      </header>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>
            Sent via Resend when enabled. The From address must be on a verified domain in Resend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveNotificationSettings} className="space-y-3">
            <input type="hidden" name="section" value="email" />
            <div className="flex items-center gap-3">
              <input
                id="email_enabled"
                name="email_enabled"
                type="checkbox"
                defaultChecked={settings?.email_enabled ?? false}
              />
              <label htmlFor="email_enabled" className="text-sm font-medium">
                Enable email notifications
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email_to">
                  Recipient address
                </label>
                <Input id="email_to" name="email_to" defaultValue={settings?.email_to ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email_from">
                  From address
                </label>
                <Input
                  id="email_from"
                  name="email_from"
                  defaultValue={settings?.email_from ?? ""}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Message service</CardTitle>
          <CardDescription>
            Send instant notifications to Telegram, Slack, or Discord.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={saveNotificationSettings} className="space-y-3">
            <input type="hidden" name="section" value="telegram" />
            <div className="flex items-center gap-3">
              <input
                id="telegram_enabled"
                name="telegram_enabled"
                type="checkbox"
                defaultChecked={settings?.telegram_enabled ?? false}
              />
              <label htmlFor="telegram_enabled" className="text-sm font-medium">
                Enable Telegram
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="telegram_bot_token">
                  Bot token
                </label>
                <Input
                  id="telegram_bot_token"
                  name="telegram_bot_token"
                  defaultValue={settings?.telegram_bot_token ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="telegram_chat_id">
                  Chat ID
                </label>
                <Input
                  id="telegram_chat_id"
                  name="telegram_chat_id"
                  defaultValue={settings?.telegram_chat_id ?? ""}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>

          <form action={saveNotificationSettings} className="space-y-3">
            <input type="hidden" name="section" value="slack" />
            <div className="flex items-center gap-3">
              <input
                id="slack_enabled"
                name="slack_enabled"
                type="checkbox"
                defaultChecked={settings?.slack_enabled ?? false}
              />
              <label htmlFor="slack_enabled" className="text-sm font-medium">
                Enable Slack Webhook
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="slack_webhook_url">
                Webhook URL
              </label>
              <Input
                id="slack_webhook_url"
                name="slack_webhook_url"
                defaultValue={settings?.slack_webhook_url ?? ""}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>

          <form action={saveNotificationSettings} className="space-y-3">
            <input type="hidden" name="section" value="discord" />
            <div className="flex items-center gap-3">
              <input
                id="discord_enabled"
                name="discord_enabled"
                type="checkbox"
                defaultChecked={settings?.discord_enabled ?? false}
              />
              <label htmlFor="discord_enabled" className="text-sm font-medium">
                Enable Discord Webhook
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="discord_webhook_url">
                Webhook URL
              </label>
              <Input
                id="discord_webhook_url"
                name="discord_webhook_url"
                defaultValue={settings?.discord_webhook_url ?? ""}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Test notification</CardTitle>
          <CardDescription>Send a test message to the configured channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveNotificationSettings}>
            <input type="hidden" name="section" value="test" />
            <Button type="submit">Send test notification</Button>
          </form>
        </CardContent>
      </Card>

      <RecentNotifications initial={log} />
    </div>
  );
}
