import { fetchAllSocialPosts } from "@/lib/admin/queries";

import { SocialPostsManager } from "./social-posts-manager";

type SocialPostsPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function SocialPostsAdminPage({ searchParams }: SocialPostsPageProps) {
  const posts = await fetchAllSocialPosts();
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;

  return <SocialPostsManager posts={posts} status={status} />;
}
