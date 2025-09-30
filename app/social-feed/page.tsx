export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { IconCircle } from "@/components/ui/icon-circle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocialPosts, getSiteSettings } from "@/lib/supabase/queries";
import { getSimpleIconBySlug, guessSimpleIconSlug } from "@/lib/simple-icons";

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
            const slug = guessSimpleIconSlug({ platform: post.platform, url: post.url });
            const icon = slug ? getSimpleIconBySlug(slug) : null;
            const postedAt = new Date(post.posted_at).toLocaleDateString();
            return (
              <Card key={post.id}>
                <CardHeader className="gap-3">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    <div className="text-foreground flex items-center gap-2">
                      <IconCircle icon={icon} fallback="globe" />
                      <span className="font-semibold uppercase tracking-wide">{post.platform}</span>
                    </div>
                    <span>{postedAt}</span>
                    {post.featured ? (
                      <Badge variant="secondary" className="font-medium uppercase">
                        Featured
                      </Badge>
                    ) : null}
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
