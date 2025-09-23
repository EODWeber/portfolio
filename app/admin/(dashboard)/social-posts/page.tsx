import { fetchAllSocialPosts } from "@/lib/admin/queries";

import { SocialPostsManager } from "./social-posts-manager";

export default async function SocialPostsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const posts = await fetchAllSocialPosts();
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return <SocialPostsManager posts={posts} status={status} />;
}
