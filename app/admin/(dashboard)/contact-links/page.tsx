import { getContactLinks } from "@/lib/supabase/queries";

import { ContactLinksManager } from "./contact-links-manager";

export default async function ContactLinksAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const links = await getContactLinks();
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return <ContactLinksManager links={links} status={status} />;
}
