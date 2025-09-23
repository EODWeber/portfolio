import { fetchAllResumes } from "@/lib/admin/queries";

import { ResumeManager } from "./resume-manager";

export default async function ResumesAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const resumes = await fetchAllResumes();
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return <ResumeManager resumes={resumes} status={status} />;
}
