import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMdxByKey } from "@/lib/supabase/queries";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  if (!key) return NextResponse.json({ content: "" });

  const doc = await getMdxByKey(key);
  return NextResponse.json({ content: doc?.content ?? "", error: doc?.download_error ?? null });
}
