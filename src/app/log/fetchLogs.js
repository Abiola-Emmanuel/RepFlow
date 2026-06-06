"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function fetchTodayLogs() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const { start, end } = getTodayRange();

  const { data, error } = await supabase
    .from("activity_logs")
    .select("activity_type,value,unit,logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", start)
    .lt("logged_at", end)
    .order("logged_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  const totals = {
    water: 0,
    pushups: 0,
    situps: 0,
    steps: 0,
  };

  data.forEach((log) => {
    const value = Number(log.value) || 0;

    if (log.activity_type === "water") {
      totals.water += value;
    }

    if (log.activity_type === "pushup") {
      totals.pushups += value;
    }

    if (log.activity_type === "situp") {
      totals.situps += value;
    }

    if (log.activity_type === "steps") {
      totals.steps += value;
    }
  });

  return { success: true, totals, logs: data };
}
