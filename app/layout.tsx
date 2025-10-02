import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getSiteProfile, getSiteSettings } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Toaster } from "sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeff Weber - Portfolio",
  description: "Security first engineering.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsPromise = getSiteSettings();
  const profilePromise = getSiteProfile();
  const [settings, profile] = await Promise.all([settingsPromise, profilePromise]);
  const isProd = process.env.NODE_ENV === "production";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground flex min-h-screen flex-col antialiased`}
      >
        <ThemeProvider>
          <SiteHeader
            siteTitle={settings?.site_title ?? "Portfolio"}
            isAuthenticated={isAuthenticated}
          />
          <main className="flex-1">{children}</main>
          <SiteFooter
            isAuthenticated={isAuthenticated}
            ownerName={profile?.full_name ?? ""}
            githubUrl={settings?.github_url ?? undefined}
            linkedinUrl={settings?.linkedin_url ?? undefined}
          />
          <Toaster richColors position="bottom-right" />
          {isProd ? (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          ) : null}
        </ThemeProvider>
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
