import { fetchAllContactRequests } from "@/lib/admin/queries";

import { ContactRequestsManager } from "./contact-request-manager";

export default async function ContactRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const requests = await fetchAllContactRequests();
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return <ContactRequestsManager requests={requests} status={status} />;
}
