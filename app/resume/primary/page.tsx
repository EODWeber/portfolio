export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getResumes } from "@/lib/supabase/queries";
import { getSignedResumeForVertical } from "@/lib/supabase/storage";

export default async function PrimaryResumesPage() {
  const resumes = (await getResumes()).filter((r) => r.featured).slice(0, 3);

  const signed = await Promise.all(
    resumes.map(async (r) => ({
      id: r.id,
      label: r.label,
      vertical: r.vertical,
      url: await getSignedResumeForVertical(r.vertical, r.file_path),
    })),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Primary resumes</h1>
        <p className="text-muted-foreground">Quickly download the three primary resume variants.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Batch download</CardTitle>
          <CardDescription>Opens each resume in a new tab for download.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {signed.map((r) => (
              <Button key={r.id} asChild variant="outline" size="sm">
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.label}
                </a>
              </Button>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => {
              signed.forEach((r) => window.open(r.url, "_blank", "noopener,noreferrer"));
            }}
          >
            Download all
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
