import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const firstName = user.user_metadata?.full_name?.split(" ")?.[0] || user.email?.split("@")?.[0] || "there";

  return <DashboardClient firstName={firstName} />;
}
