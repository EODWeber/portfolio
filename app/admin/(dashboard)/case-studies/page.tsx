import { fetchAllCaseStudies, fetchAvailableMdxDocuments } from "@/lib/admin/queries";

import { CaseStudyManager } from "./case-study-manager";

export default async function CaseStudiesAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [caseStudies, availableDocs] = await Promise.all([
    fetchAllCaseStudies(),
    fetchAvailableMdxDocuments(),
  ]);
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return (
    <CaseStudyManager caseStudies={caseStudies} availableDocs={availableDocs} status={status} />
  );
}
