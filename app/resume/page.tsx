export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumes, getSiteProfile } from "@/lib/supabase/queries";

export default async function ResumePage() {
  const [profile, resumes] = await Promise.all([getSiteProfile(), getResumes()]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Resume Library</h1>
        <p className="text-muted-foreground text-lg">
          {profile?.summary ??
            "Vertical-specific resumes stored in Supabase Storage. Download signed copies tailored to each focus area."}
        </p>
      </header>

      {resumes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No resumes on file yet. Upload PDFs to the `resumes` storage bucket and insert metadata
          into `public.resumes` to expose download links.
        </p>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <CardTitle className="text-xl">{resume.label}</CardTitle>
                <CardDescription>
                  Updated {new Date(resume.updated_at).toLocaleDateString()} — optimized for{" "}
                  {resume.vertical.replace("-", " ")}
                  roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/resume/${resume.vertical}`}
                  className="text-primary text-sm hover:underline"
                >
                  Generate secure download →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
