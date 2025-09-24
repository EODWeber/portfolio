export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { siGithub, siX, siLinkedin, siYoutube, siRss } from "simple-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocialPosts, getSiteSettings } from "@/lib/supabase/queries";

export default async function SocialFeedPage() {
  const [posts, settings] = await Promise.all([getSocialPosts(), getSiteSettings()]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {settings?.social_heading ?? "Social feed"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {settings?.social_subheading ??
            "Talks, open-source drops, and long-form posts—automatically surfaced from connected accounts."}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => {
            const p = post.platform.toLowerCase();
            const icon = p.includes("github")
              ? siGithub
              : p.includes("x") || p.includes("twitter")
                ? siX
                : p.includes("linkedin")
                  ? siLinkedin
                  : p.includes("youtube")
                    ? siYoutube
                    : siRss;
            return (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription className="text-sm">{post.platform}</CardDescription>
                  <div className="text-muted-foreground flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{new Date(post.posted_at).toLocaleDateString()}</span>
                      {post.featured ? (
                        <Badge variant="secondary" className="font-medium uppercase">
                          Featured
                        </Badge>
                      ) : null}
                    </div>
                    <span
                      aria-hidden
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `#${icon.hex}` }}
                      title={post.platform}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d={icon.path} />
                      </svg>
                    </span>
                    &nbsp;
                    {post.platform}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {post.summary ? <p className="text-muted-foreground">{post.summary}</p> : null}
                  <Link
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Open link →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
