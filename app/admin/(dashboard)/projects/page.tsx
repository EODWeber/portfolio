import { fetchAllProjects } from "@/lib/admin/queries";

import { ProjectManager } from "./project-manager";

type ProjectsPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ProjectsAdminPage({ searchParams }: ProjectsPageProps) {
  const projects = await fetchAllProjects();
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;

  return <ProjectManager projects={projects} status={status} />;
}
