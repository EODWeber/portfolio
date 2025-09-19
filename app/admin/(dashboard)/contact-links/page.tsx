import { getContactLinks } from "@/lib/supabase/queries";

import { ContactLinksManager } from "./contact-links-manager";

type ContactLinksPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ContactLinksAdminPage({ searchParams }: ContactLinksPageProps) {
  const links = await getContactLinks();
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;

  return <ContactLinksManager links={links} status={status} />;
}
