import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoachClient from "./coach-client";

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const firstName =
    user.user_metadata?.full_name?.split(" ")?.[0] ||
    user.email?.split("@")?.[0] ||
    "there";

  return <CoachClient firstName={firstName} />;
}
