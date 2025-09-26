import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSiteSettings } from "@/lib/supabase/queries";

import { upsertSiteSettings } from "./actions";

export default async function SiteSettingsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const settings = await getSiteSettings();
  const saved = sp?.status === "success";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Site Settings</h1>
        <p className="text-muted-foreground text-sm">
          Update global metadata, hero, CTAs, and section headings.
        </p>
      </header>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Site configuration</CardTitle>
          <CardDescription>Organized by section to speed up edits.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="brand">
            <TabsList className="mb-4 grid w-full grid-cols-7">
              <TabsTrigger value="brand">Brand</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="studies">Case Studies</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="brand">
              <form action={upsertSiteSettings} className="space-y-4">
                <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="site_title">
                    Site title
                  </label>
                  <Input
                    id="site_title"
                    name="site_title"
                    defaultValue={settings?.site_title ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="site_tagline">
                    Site tagline
                  </label>
                  <Input
                    id="site_tagline"
                    name="site_tagline"
                    defaultValue={settings?.site_tagline ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="meta_description">
                    Meta description
                  </label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    defaultValue={settings?.meta_description ?? ""}
                    rows={3}
                  />
                </div>
                {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="home">
              <form action={upsertSiteSettings} className="space-y-4">
                <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="hero_heading">
                    Hero heading
                  </label>
                  <Input
                    id="hero_heading"
                    name="hero_heading"
                    defaultValue={settings?.hero_heading ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="hero_subheading">
                    Hero subheading
                  </label>
                  <Textarea
                    id="hero_subheading"
                    name="hero_subheading"
                    defaultValue={settings?.hero_subheading ?? ""}
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="hiring_status">
                      Hiring status
                    </label>
                    <Input
                      id="hiring_status"
                      name="hiring_status"
                      defaultValue={settings?.hiring_status ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="location">
                      Location / availability
                    </label>
                    <Input id="location" name="location" defaultValue={settings?.location ?? ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="resume_preference">
                    Default resume vertical
                  </label>
                  <select
                    id="resume_preference"
                    name="resume_preference"
                    defaultValue={(settings?.resume_preference as string) ?? "ai-security"}
                    className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <option value="ai-security">AI Security</option>
                    <option value="secure-devops">Secure DevOps</option>
                    <option value="soc">SOC</option>
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="primary_cta_label">
                      Primary CTA label
                    </label>
                    <Input
                      id="primary_cta_label"
                      name="primary_cta_label"
                      defaultValue={settings?.primary_cta_label ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="primary_cta_url">
                      Primary CTA URL
                    </label>
                    <Input
                      id="primary_cta_url"
                      name="primary_cta_url"
                      defaultValue={settings?.primary_cta_url ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="secondary_cta_label">
                      Secondary CTA label
                    </label>
                    <Input
                      id="secondary_cta_label"
                      name="secondary_cta_label"
                      defaultValue={settings?.secondary_cta_label ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="secondary_cta_url">
                      Secondary CTA URL
                    </label>
                    <Input
                      id="secondary_cta_url"
                      name="secondary_cta_url"
                      defaultValue={settings?.secondary_cta_url ?? ""}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_projects_heading">
                      Projects heading
                    </label>
                    <Input
                      id="home_projects_heading"
                      name="home_projects_heading"
                      defaultValue={settings?.home_projects_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_projects_subheading">
                      Projects subheading
                    </label>
                    <Input
                      id="home_projects_subheading"
                      name="home_projects_subheading"
                      defaultValue={settings?.home_projects_subheading ?? ""}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_studies_heading">
                      Case studies heading
                    </label>
                    <Input
                      id="home_studies_heading"
                      name="home_studies_heading"
                      defaultValue={settings?.home_studies_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_studies_subheading">
                      Case studies subheading
                    </label>
                    <Input
                      id="home_studies_subheading"
                      name="home_studies_subheading"
                      defaultValue={settings?.home_studies_subheading ?? ""}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_articles_heading">
                      Articles heading
                    </label>
                    <Input
                      id="home_articles_heading"
                      name="home_articles_heading"
                      defaultValue={settings?.home_articles_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_articles_subheading">
                      Articles subheading
                    </label>
                    <Input
                      id="home_articles_subheading"
                      name="home_articles_subheading"
                      defaultValue={settings?.home_articles_subheading ?? ""}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_social_heading">
                      Social feed heading
                    </label>
                    <Input
                      id="home_social_heading"
                      name="home_social_heading"
                      defaultValue={settings?.home_social_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="home_social_subheading">
                      Social feed subheading
                    </label>
                    <Input
                      id="home_social_subheading"
                      name="home_social_subheading"
                      defaultValue={settings?.home_social_subheading ?? ""}
                    />
                  </div>
                </div>
                {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="portfolio">
              <form action={upsertSiteSettings} className="space-y-4">
                <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="portfolio_heading">
                      Portfolio heading
                    </label>
                    <Input
                      id="portfolio_heading"
                      name="portfolio_heading"
                      defaultValue={settings?.portfolio_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="portfolio_subheading">
                      Portfolio subheading
                    </label>
                    <Input
                      id="portfolio_subheading"
                      name="portfolio_subheading"
                      defaultValue={settings?.portfolio_subheading ?? ""}
                    />
                  </div>
                </div>
                {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="studies">
              <form action={upsertSiteSettings} className="space-y-4">
                <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="studies_heading">
                      Case studies heading
                    </label>
                    <Input
                      id="studies_heading"
                      name="studies_heading"
                      defaultValue={settings?.studies_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="studies_subheading">
                      Case studies subheading
                    </label>
                    <Input
                      id="studies_subheading"
                      name="studies_subheading"
                      defaultValue={settings?.studies_subheading ?? ""}
                    />
                  </div>
                </div>
                {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="articles">
              <form action={upsertSiteSettings} className="space-y-4">
                <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="articles_heading">
                      Articles heading
                    </label>
                    <Input
                      id="articles_heading"
                      name="articles_heading"
                      defaultValue={settings?.articles_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="articles_subheading">
                      Articles subheading
                    </label>
                    <Input
                      id="articles_subheading"
                      name="articles_subheading"
                      defaultValue={settings?.articles_subheading ?? ""}
                    />
                  </div>
                </div>
                {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="social">
              <form action={upsertSiteSettings} className="space-y-4">
                <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="social_heading">
                      Social feed heading
                    </label>
                    <Input
                      id="social_heading"
                      name="social_heading"
                      defaultValue={settings?.social_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="social_subheading">
                      Social feed subheading
                    </label>
                    <Input
                      id="social_subheading"
                      name="social_subheading"
                      defaultValue={settings?.social_subheading ?? ""}
                    />
                  </div>
                </div>
                {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="contact">
              <form action={upsertSiteSettings} className="space-y-4">
                <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact_heading">
                      Contact heading
                    </label>
                    <Input
                      id="contact_heading"
                      name="contact_heading"
                      defaultValue={settings?.contact_heading ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact_subheading">
                      Contact subheading
                    </label>
                    <Input
                      id="contact_subheading"
                      name="contact_subheading"
                      defaultValue={settings?.contact_subheading ?? ""}
                    />
                  </div>
                </div>
                {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
