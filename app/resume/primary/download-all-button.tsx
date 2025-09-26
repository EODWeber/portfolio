"use client";

import { Button } from "@/components/ui/button";

type DownloadAllButtonProps = {
  resumes: Array<{ id: string; label: string; url: string }>;
};

export function DownloadAllButton({ resumes }: DownloadAllButtonProps) {
  if (!resumes || resumes.length === 0) {
    return null;
  }

  return (
    <Button
      type="button"
      onClick={() => {
        resumes.forEach((resume) => {
          window.open(resume.url, "_blank", "noopener,noreferrer");
        });
      }}
    >
      Download all
    </Button>
  );
}
