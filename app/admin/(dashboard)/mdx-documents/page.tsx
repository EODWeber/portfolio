import { fetchAllMdxDocuments } from "@/lib/admin/queries";

import { MdxDocumentsManager } from "./ui";

export default async function MdxDocumentsAdminPage() {
  const docs = await fetchAllMdxDocuments();
  return <MdxDocumentsManager initialDocs={docs} />;
}

