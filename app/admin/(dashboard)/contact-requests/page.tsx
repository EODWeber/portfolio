import { fetchAllContactRequests } from "@/lib/admin/queries";

import { ContactRequestsManager } from "./contact-request-manager";

type ContactRequestsPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ContactRequestsPage({ searchParams }: ContactRequestsPageProps) {
  const requests = await fetchAllContactRequests();
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;

  return <ContactRequestsManager requests={requests} status={status} />;
}
