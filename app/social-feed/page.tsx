import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { siGithub, siX, siLinkedin, siYoutube, siRss } from "simple-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocialPosts } from "@/lib/supabase/queries";

export default async function SocialFeedPage() {
  const posts = await getSocialPosts();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Social feed</h1>
        <p className="text-muted-foreground text-lg">
          Talks, open-source drops, and long-form posts—automatically surfaced from connected
          accounts.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No posts logged yet. Seed `public.social_posts` to populate this feed.
        </p>
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
                    &nbsp; - &nbsp;
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{new Date(post.posted_at).toLocaleDateString()}</span>
                        {post.featured ? (
                          <Badge variant="secondary" className="font-medium uppercase">
                            Featured
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardDescription>

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
