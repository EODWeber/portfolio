import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumeByVertical } from "@/lib/supabase/queries";
import { getSignedResumeForVertical } from "@/lib/supabase/storage";
import type { Vertical } from "@/lib/supabase/types";

export default async function ResumeDownloadPage({
  params,
}: {
  params: Promise<{ vertical: Vertical }>;
}) {
  const p = await params;
  const resume = await getResumeByVertical(p.vertical);

  if (!resume) {
    notFound();
  }

  const signedUrl = await getSignedResumeForVertical(resume.vertical, resume.file_path);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle>{resume.label}</CardTitle>
          <CardDescription>
            Access a private download link that stays active for 120 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild>
            <a href={signedUrl} target="_blank" rel="noreferrer">
              Download resume
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
