import { fetchAllResumes } from "@/lib/admin/queries";

import { ResumeManager } from "./resume-manager";

type ResumesPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ResumesAdminPage({ searchParams }: ResumesPageProps) {
  const resumes = await fetchAllResumes();
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;

  return <ResumeManager resumes={resumes} status={status} />;
}
