import { fetchAllCaseStudies, fetchAvailableMdxDocuments } from "@/lib/admin/queries";

import { CaseStudyManager } from "./case-study-manager";

type CaseStudiesPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function CaseStudiesAdminPage({ searchParams }: CaseStudiesPageProps) {
  const [caseStudies, availableDocs] = await Promise.all([
    fetchAllCaseStudies(),
    fetchAvailableMdxDocuments(),
  ]);
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;

  return (
    <CaseStudyManager caseStudies={caseStudies} availableDocs={availableDocs} status={status} />
  );
}
