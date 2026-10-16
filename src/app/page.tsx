import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Library } from "@/components/library";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return <Suspense fallback={null}><HomeContent /></Suspense>;
}

async function HomeContent() {
  if (!getSupabaseConfig()) {
    return <Library books={[]} email={null} configured={false} />;
  }
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: books, error } = await supabase.from("books")
    .select("*").eq("user_id", user.id).order("updated_at", { ascending: false });

  return <Library books={books ?? []} email={user.email ?? null} configured loadError={Boolean(error)} />;
}
