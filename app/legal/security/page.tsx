import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MDXServer } from "@/components/mdx/mdx-server";
import type { LegalDoc } from "@/.contentlayer/generated";
import { findArticleDoc, getMdxSourceOrNull } from "@/lib/content/resolve";

export default async function SecurityPage() {
  const key = "legal/security.mdx";
  const supabaseMdx = await getMdxSourceOrNull(key);
  const doc = findArticleDoc(key);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Security Overview</h1>
      </header>

      {supabaseMdx ? (
        <MDXServer source={supabaseMdx} />
      ) : doc ? (
        <MDXServer source={(doc as LegalDoc).body.raw ?? ""} />
      ) : (
        <section className="text-muted-foreground space-y-4 text-sm leading-7">
          <p>Provide legal/security.mdx via MDX Documents or in the content folder.</p>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Security posture</CardTitle>
          <CardDescription>
            Snapshot of the controls highlighted across the portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>Infrastructure hardening: signed builds, dependency POA, and environment parity.</p>
          <p>
            Application controls: Supabase RLS, signed storage URLs, and CSP ready to enforce strict
            transport.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
