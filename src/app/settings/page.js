import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = {
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split("@")?.[0] || "RepFlow user",
    username: user.user_metadata?.username || "",
    provider: user.app_metadata?.provider || "email",
    createdAt: user.created_at,
  };

  return <SettingsClient profile={profile} />;
}
