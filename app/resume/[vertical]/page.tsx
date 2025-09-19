import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumeByVertical } from "@/lib/supabase/queries";
import { getSignedResumeForVertical } from "@/lib/supabase/storage";
import type { Vertical } from "@/lib/supabase/types";

type ResumeDownloadPageProps = {
  params: { vertical: Vertical };
};

export default async function ResumeDownloadPage({ params }: ResumeDownloadPageProps) {
  const resume = await getResumeByVertical(params.vertical);

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
            The link below uses a short-lived Supabase signed URL (valid for 120 seconds) to protect
            private resume copies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild>
            <a href={signedUrl} target="_blank" rel="noreferrer">
              Download resume
            </a>
          </Button>
          <p className="text-muted-foreground text-sm">
            Signed URLs are generated on demand using the service role key (see `.docs/DOPPLER.md`)
            keeping files private while enabling frictionless recruiter access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
