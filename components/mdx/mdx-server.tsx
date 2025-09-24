import { compileMDX } from "next-mdx-remote/rsc";
import type { PluggableList } from "unified";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

import { cn } from "@/lib/utils";

export async function MDXServer({ source }: { source: string }) {
  const remarkPlugins: PluggableList = [remarkGfm];
  const rehypePlugins: PluggableList = [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" }],
    [rehypePrettyCode, { theme: "github-dark" }],
  ];

  const { content } = await compileMDX<unknown | undefined>({
    source,
    options: {
      // Parse and strip YAML front‑matter so it never renders on public pages.
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins,
        rehypePlugins,
      },
    },
  });

  return (
    <article
      className={cn(
        "text-muted-foreground max-w-none space-y-4 text-base leading-7",
        "[&_h1]:text-foreground [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold",
        "[&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold",
        "[&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_p]:text-muted-foreground [&_strong]:text-foreground [&_a]:text-primary [&_a:hover]:underline",
        "[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6",
        "[&_blockquote]:border-primary [&_blockquote]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:pl-4",
      )}
    >
      {content}
    </article>
  );
}
