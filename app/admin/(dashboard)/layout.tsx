export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

import { AdminNav } from "@/app/admin/_components/admin-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/supabase/queries";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <AdminNav siteTitle={settings?.site_title ?? "Admin"} userEmail={user.email} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
