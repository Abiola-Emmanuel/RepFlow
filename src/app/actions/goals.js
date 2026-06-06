"use server";

import { createClient } from "@/lib/supabase/server";

export async function getGoals() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("goals")
    .select("water_cl, pushups, situps, steps")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    return {
      data: { water_cl: 250, pushups: 50, situps: 50, steps: 10000 },
    };
  }

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function saveGoals({ water_cl, pushups, situps, steps }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  if (!water_cl || !pushups || !situps || !steps) {
    return { error: "All goals must have a value greater than zero." };
  }

  const { error } = await supabase.from("goals").upsert(
    {
      user_id: user.id,
      water_cl: Math.round(water_cl),
      pushups: Math.round(pushups),
      situps: Math.round(situps),
      steps: Math.round(steps),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
