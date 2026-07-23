import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data?.user ?? data?.session?.user;

    if (user?.user_metadata?.onboarding_complete === false) {
      next = "/onboarding";
    } else if (user?.user_metadata?.onboarding_complete === true && next === "/onboarding") {
      next = "/dashboard";
    } else if (
      user &&
      user.user_metadata?.onboarding_complete !== true &&
      next === "/onboarding"
    ) {
      // First-time Google/email confirm path: mark incomplete so middleware keeps them in setup
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          onboarding_complete: false,
        },
      });
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
