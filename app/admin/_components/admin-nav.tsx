import Link from "next/link";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/site-settings", label: "Site Settings" },
  { href: "/admin/site-profile", label: "Profile" },
  { href: "/admin/contact-links", label: "Contact Methods" },
  { href: "/admin/contact-requests", label: "Inbox" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/case-studies", label: "Case Studies" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/resumes", label: "Resumes" },
  { href: "/admin/mdx-documents", label: "MDX Documents" },
  { href: "/admin/social-posts", label: "Social Accounts" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav({
  siteTitle,
  userEmail,
}: {
  siteTitle: string;
  userEmail: string | null | undefined;
}) {
  return (
    <aside className="border-border/60 bg-muted/40 hidden w-64 flex-col border-r p-6 text-sm lg:flex">
      <div className="space-y-1">
        <p className="text-base font-semibold">{siteTitle}</p>
        <p className="text-muted-foreground text-xs">{userEmail ?? "admin"}</p>
      </div>
      <nav className="mt-8 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "hover:bg-background hover:text-foreground rounded-md px-3 py-2 font-medium transition-colors",
              "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
