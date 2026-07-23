import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (user.user_metadata?.onboarding_complete === true) {
    redirect("/dashboard");
  }

  const existingUsername = user.user_metadata?.username || "";
  const needsUsername = !existingUsername;

  return (
    <OnboardingClient
      initialUsername={existingUsername}
      needsUsername={needsUsername}
    />
  );
}
