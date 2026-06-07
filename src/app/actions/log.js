"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveAllLogs({ waterEntries, pushupSets, situpSets, steps }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const now = new Date().toISOString();
  const rows = [];
  const safeWaterEntries = Array.isArray(waterEntries) ? waterEntries : [];
  const safePushupSets = Array.isArray(pushupSets) ? pushupSets : [];
  const safeSitupSets = Array.isArray(situpSets) ? situpSets : [];

  safeWaterEntries.forEach((entry) => {
    rows.push({
      user_id: user.id,
      activity_type: "water",
      value: entry.amount,
      unit: "cl",
      logged_at: now,
    });
  });

  safePushupSets.forEach((set) => {
    rows.push({
      user_id: user.id,
      activity_type: "pushup",
      value: set.reps,
      unit: "reps",
      logged_at: now,
    });
  });

  safeSitupSets.forEach((set) => {
    rows.push({
      user_id: user.id,
      activity_type: "situp",
      value: set.reps,
      unit: "reps",
      logged_at: now,
    });
  });

  if (steps > 0) {
    rows.push({
      user_id: user.id,
      activity_type: "steps",
      value: steps,
      unit: "steps",
      logged_at: now,
    });
  }

  if (rows.length === 0) {
    return { error: "Nothing to log" };
  }

  const { error } = await supabase.from("activity_logs").insert(rows);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
