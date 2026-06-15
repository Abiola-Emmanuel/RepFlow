"use server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_GOALS = {
  water_cl: 250,
  pushups: 50,
  situps: 50,
  steps: 10000,
  goal_type: "daily",
};

const VALID_GOAL_TYPES = ["daily", "weekly", "monthly"];

function toPositiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function normalizeGoals(data = {}) {
  return {
    water_cl: toPositiveNumber(data.water_cl, DEFAULT_GOALS.water_cl),
    pushups: toPositiveNumber(data.pushups, DEFAULT_GOALS.pushups),
    situps: toPositiveNumber(data.situps, DEFAULT_GOALS.situps),
    steps: toPositiveNumber(data.steps, DEFAULT_GOALS.steps),
    goal_type: VALID_GOAL_TYPES.includes(data.goal_type)
      ? data.goal_type
      : DEFAULT_GOALS.goal_type,
  };
}

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
    .select("water_cl, pushups, situps, steps, goal_type")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    return { data: DEFAULT_GOALS };
  }

  if (error) {
    return { error: error.message };
  }

  return { data: normalizeGoals(data) };
}

export async function saveGoals({ water_cl, pushups, situps, steps, goal_type }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const nextGoals = {
    water_cl: Number(water_cl),
    pushups: Number(pushups),
    situps: Number(situps),
    steps: Number(steps),
    goal_type: goal_type ?? "daily",
  };

  if (
    !Number.isFinite(nextGoals.water_cl) || nextGoals.water_cl <= 0 ||
    !Number.isFinite(nextGoals.pushups) || nextGoals.pushups <= 0 ||
    !Number.isFinite(nextGoals.situps) || nextGoals.situps <= 0 ||
    !Number.isFinite(nextGoals.steps) || nextGoals.steps <= 0
  ) {
    return { error: "All goals must have a value greater than zero." };
  }

  if (!VALID_GOAL_TYPES.includes(nextGoals.goal_type)) {
    return { error: "Invalid goal type. Must be daily, weekly, or monthly." };
  }

  const { error } = await supabase.from("goals").upsert(
    {
      user_id: user.id,
      water_cl: Math.round(nextGoals.water_cl),
      pushups: Math.round(nextGoals.pushups),
      situps: Math.round(nextGoals.situps),
      steps: Math.round(nextGoals.steps),
      goal_type: nextGoals.goal_type,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}