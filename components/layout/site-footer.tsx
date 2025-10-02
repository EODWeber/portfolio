import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";

type SiteFooterProps = {
  isAuthenticated?: boolean;
  ownerName?: string;
  githubUrl?: string;
  linkedinUrl?: string;
};

export function SiteFooter({
  isAuthenticated,
  ownerName,
  githubUrl,
  linkedinUrl,
}: SiteFooterProps) {
  const displayName = ownerName?.trim() ? ownerName : "Portfolio owner";
  return (
    <footer className="border-border/60 bg-background/95 mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {displayName}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/legal/security" className="hover:text-foreground transition-colors">
            Security
          </Link>
          {githubUrl ? (
            <Link
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          ) : null}
          {linkedinUrl ? (
            <Link
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </Link>
          ) : null}
          {isAuthenticated ? (
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
          ) : (
            <Link href="/admin/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
