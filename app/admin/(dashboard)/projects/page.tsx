import {
  fetchAllProjects,
  fetchAllCaseStudies,
  fetchCaseStudyIdsByProject,
  fetchAllArticles,
  fetchArticleIdsByProject,
} from "@/lib/admin/queries";

import { ProjectManager } from "./project-manager";

export default async function ProjectsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [projects, caseStudies, rel, articles, articleRel] = await Promise.all([
    fetchAllProjects(),
    fetchAllCaseStudies(),
    fetchCaseStudyIdsByProject(),
    fetchAllArticles(),
    fetchArticleIdsByProject(),
  ]);
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return (
    <ProjectManager
      projects={projects}
      caseStudies={caseStudies}
      relatedCaseStudyIdsByProject={rel}
      articles={articles}
      relatedArticleIdsByProject={articleRel}
      status={status}
    />
  );
}
