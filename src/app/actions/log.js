"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function saveAllLogs({ waterEntries, pushupSets, situpSets, steps }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );


  // get the logged in user...
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  const now = new Date().toISOString();
  const today = now.split("T")[0]; // YYYY-MM-DD
  const rows = [];

  // water entries
  waterEntries.forEach((entry) => {
    rows.push({
      user_id: user.id,
      activity_type: "water",
      value: entry.amount,
      unit: "cl",
      logged_at: now,
    });
  });


  // pushup sets
  pushupSets.forEach((set) => {
    rows.push({
      user_id: user.id,
      activity_type: "pushup",
      value: set.reps,
      unit: "reps",
      logged_at: now,
    });
  });

  // situp sets
  situpSets.forEach((set) => {
    rows.push({
      user_id: user.id,
      activity_type: "situp",
      value: set.reps,
      unit: "reps",
      logged_at: now,
    });
  });

  // steps — only add if > 0
  if (steps > 0) {
    rows.push({
      user_id: user.id,
      activity_type: "steps",
      value: steps,
      unit: "steps",
      logged_at: now,
    });
  }

  if (rows.length === 0) return { error: "Nothing to log" };


  const { error } = await supabase.from("activity_logs").insert(rows);
  if (error) return { error: error.message };

  return { success: true };

}