import { redirect } from "next/navigation";

export default function FeedPage() {
  redirect("/social-feed");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
