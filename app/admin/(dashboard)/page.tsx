import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAllArticles,
  fetchAllCaseStudies,
  fetchAllProjects,
  fetchAllResumes,
  fetchSiteProfile,
  fetchSiteSettings,
} from "@/lib/admin/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { signOutAction } from "./actions";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [settings, profile, projects, caseStudies, articles, resumes] = await Promise.all([
    fetchSiteSettings(),
    fetchSiteProfile(),
    fetchAllProjects(),
    fetchAllCaseStudies(),
    fetchAllArticles(),
    fetchAllResumes(),
  ]);

  const publishedProjects = projects.filter((project) => project.status === "published").length;
  const draftProjects = projects.length - publishedProjects;
  const publishedStudies = caseStudies.filter((study) => study.status === "published").length;
  const draftStudies = caseStudies.length - publishedStudies;
  const publishedArticles = articles.filter((article) => article.status === "published").length;
  const draftArticles = articles.length - publishedArticles;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Admin dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage site content, branding, and supporting assets from a single workspace.
          </p>
        </div>
        <form action={signOutAction}>
          <Button variant="outline">Sign out</Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              {publishedProjects} published · {draftProjects} drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/projects">Manage projects →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Case studies</CardTitle>
            <CardDescription>
              {publishedStudies} published · {draftStudies} drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/case-studies">Manage case studies →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
            <CardDescription>
              {publishedArticles} published · {draftArticles} drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/articles">Manage articles →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumes</CardTitle>
            <CardDescription>{resumes.length} storage entries</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/resumes">Manage resumes →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>{settings?.site_title ?? "Set site title"}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground flex flex-col gap-2 text-sm">
            <p>{profile?.headline ?? "Add a headline in Site Profile."}</p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/site-settings">Site settings</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/site-profile">Site profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
