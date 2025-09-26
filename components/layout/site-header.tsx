"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/articles", label: "Articles" },
  { href: "/social-feed", label: "Social Feed" },
];

export function SiteHeader({
  siteTitle,
  isAuthenticated,
}: {
  siteTitle: string;
  isAuthenticated?: boolean;
}) {
  return (
    <header className="supports-[backdrop-filter]:bg-background/80 border-border/60 bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteTitle}
        </Link>
        <div className="hidden items-center gap-6 sm:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {links.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              {isAuthenticated ? (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin"
                      className={cn(
                        "text-sm font-medium transition-colors",
                        // Ensure visibility; avoid overly muted styling for Admin link
                        "text-foreground hover:opacity-80",
                      )}
                    >
                      Admin
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ) : null}
            </NavigationMenuList>
          </NavigationMenu>
          <Button asChild size="sm">
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
        <div className="sm:hidden">
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/admin">Admin</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
