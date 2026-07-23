"use server";

import { createClient } from "@/lib/supabase/server";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export async function updateProfileMetadata(updates = {}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const nextMetadata = { ...user.user_metadata };

  if (typeof updates.username === "string") {
    const username = updates.username.trim();
    if (!USERNAME_PATTERN.test(username)) {
      return { error: "Username must be 3–20 characters (letters, numbers, underscores)." };
    }
    nextMetadata.username = username;
    if (!nextMetadata.full_name) {
      nextMetadata.full_name = username;
    }
  }

  if (typeof updates.onboarding_complete === "boolean") {
    nextMetadata.onboarding_complete = updates.onboarding_complete;
  }

  const { error } = await supabase.auth.updateUser({ data: nextMetadata });

  if (error) {
    return { error: error.message };
  }

  return { success: true, metadata: nextMetadata };
}

export async function completeOnboarding({ username, goals }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  if (username) {
    const usernameResult = await updateProfileMetadata({ username });
    if (usernameResult.error) {
      return usernameResult;
    }
  }

  if (goals) {
    const { saveGoals } = await import("@/app/actions/goals");
    const goalsResult = await saveGoals(goals);
    if (goalsResult.error) {
      return goalsResult;
    }
  }

  const completeResult = await updateProfileMetadata({ onboarding_complete: true });
  if (completeResult.error) {
    return completeResult;
  }

  return { success: true };
}
