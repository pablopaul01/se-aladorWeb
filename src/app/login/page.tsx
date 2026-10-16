import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/login-screen";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
export default function Login() {
  return <Suspense fallback={null}><LoginContent /></Suspense>;
}
async function LoginContent() {
  const configured = Boolean(getSupabaseConfig());
  if (configured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/");
  }
  return <LoginScreen configured={configured} />;
}
