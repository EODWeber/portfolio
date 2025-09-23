import { fetchAllProjects } from "@/lib/admin/queries";

import { ProjectManager } from "./project-manager";

export default async function ProjectsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const projects = await fetchAllProjects();
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return <ProjectManager projects={projects} status={status} />;
}
