"use server";

import { createClient } from "@/lib/supabase/server";

// ─── helpers ────────────────────────────────────────────────────────────────

function getTodayRange(range) {
  if (range?.start && range?.end) {
    return { start: range.start, end: range.end };
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start: start.toISOString(), end: end.toISOString() };
}

/** Accumulate raw log rows into a totals object. */
function accumulateLogs(logs, target) {
  logs.forEach((log) => {
    const value = Number(log.value) || 0;
    if (log.activity_type === "water") target.water += value;
    if (log.activity_type === "pushup") target.pushups += value;
    if (log.activity_type === "situp") target.situps += value;
    if (log.activity_type === "steps") target.steps += value;
    target.total += value;
  });
}

/** Return the Monday of the week containing `date`. */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return YYYY-MM-DD string. */
function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Return YYYY-MM period key. */
function toMonthKey(date) {
  return date.toISOString().slice(0, 7);
}

/** Check whether totals meet all goals. Returns { water, pushups, situps, steps }. */
function computeGoalHit(totals, goals) {
  return {
    water: totals.water >= goals.water_cl,
    pushups: totals.pushups >= goals.pushups,
    situps: totals.situps >= goals.situps,
    steps: totals.steps >= goals.steps,
  };
}

/**
 * Compute per-activity streaks from an ordered array of periods (oldest → newest).
 * A streak is the number of consecutive periods ending at the last period where
 * the goal was hit.
 */
function computeStreaks(periods) {
  const activities = ["water", "pushups", "situps", "steps"];
  const streaks = { water: 0, pushups: 0, situps: 0, steps: 0 };

  for (const activity of activities) {
    let count = 0;
    // Walk backwards from the most recent period
    for (let i = periods.length - 1; i >= 0; i--) {
      if (periods[i].goalHit?.[activity]) {
        count++;
      } else {
        break;
      }
    }
    streaks[activity] = count;
  }

  return streaks;
}

// ─── fetchTodayLogs (unchanged) ──────────────────────────────────────────────

export async function fetchTodayLogs(range) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  const { start, end } = getTodayRange(range);

  const { data, error } = await supabase
    .from("activity_logs")
    .select("activity_type,value,unit,logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", start)
    .lt("logged_at", end)
    .order("logged_at", { ascending: false });

  if (error) return { error: error.message };

  const totals = { water: 0, pushups: 0, situps: 0, steps: 0, total: 0 };
  accumulateLogs(data, totals);
  delete totals.total; // dashboard doesn't need this

  return { success: true, totals, logs: data };
}

// ─── fetchHistoryLogs ────────────────────────────────────────────────────────

export async function fetchHistoryLogs({ days = 7, forceDaily = false } = {}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  // Fetch goals so we know the goal_type and targets
  const { data: goalsData, error: goalsError } = await supabase
    .from("goals")
    .select("water_cl, pushups, situps, steps, goal_type")
    .eq("user_id", user.id)
    .single();

  const goals = goalsError
    ? { water_cl: 250, pushups: 50, situps: 50, steps: 10000, goal_type: "daily" }
    : goalsData;

  const goalType = forceDaily ? "daily" : (goals.goal_type ?? "daily");

  // ── date range ────────────────────────────────────────────────────────────
  const rangeDays = days === 7 ? 7 : 30;

  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);
  rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));

  // For weekly grouping, extend start back to Monday of the first week
  const fetchStart = goalType === "weekly"
    ? getWeekStart(rangeStart)
    : rangeStart;

  const fetchEnd = new Date();
  fetchEnd.setHours(23, 59, 59, 999);

  // ── query ─────────────────────────────────────────────────────────────────
  const { data: logs, error: logsError } = await supabase
    .from("activity_logs")
    .select("activity_type,value,unit,logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", fetchStart.toISOString())
    .lte("logged_at", fetchEnd.toISOString())
    .order("logged_at", { ascending: true });

  if (logsError) return { error: logsError.message };

  // ── group logs into periods ───────────────────────────────────────────────
  let periods = [];

  if (goalType === "daily") {
    // One entry per day in the range
    const daysMap = new Map();

    for (let i = 0; i < rangeDays; i++) {
      const date = new Date(rangeStart);
      date.setDate(rangeStart.getDate() + i);
      const key = toDateKey(date);

      daysMap.set(key, {
        key,
        date: key,
        label: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
        weekday: date.toLocaleDateString("en", { weekday: "short" }),
        water: 0, pushups: 0, situps: 0, steps: 0, total: 0,
      });
    }

    logs.forEach((log) => {
      const key = new Date(log.logged_at).toISOString().slice(0, 10);
      const day = daysMap.get(key);
      if (!day) return;
      const value = Number(log.value) || 0;
      if (log.activity_type === "water") day.water += value;
      if (log.activity_type === "pushup") day.pushups += value;
      if (log.activity_type === "situp") day.situps += value;
      if (log.activity_type === "steps") day.steps += value;
      day.total += value;
    });

    periods = Array.from(daysMap.values()).map((p) => ({
      ...p,
      goalHit: computeGoalHit(p, goals),
    }));

  } else if (goalType === "weekly") {
    // Group by ISO week (Mon–Sun)
    const weeksMap = new Map();

    logs.forEach((log) => {
      const logDate = new Date(log.logged_at);
      const weekStart = getWeekStart(logDate);
      const key = toDateKey(weekStart);

      if (!weeksMap.has(key)) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weeksMap.set(key, {
          key,
          date: key,
          label: `${weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en", { month: "short", day: "numeric" })}`,
          weekday: `W/C ${weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })}`,
          water: 0, pushups: 0, situps: 0, steps: 0, total: 0,
        });
      }

      const week = weeksMap.get(key);
      const value = Number(log.value) || 0;
      if (log.activity_type === "water") week.water += value;
      if (log.activity_type === "pushup") week.pushups += value;
      if (log.activity_type === "situp") week.situps += value;
      if (log.activity_type === "steps") week.steps += value;
      week.total += value;
    });

    periods = Array.from(weeksMap.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((p) => ({ ...p, goalHit: computeGoalHit(p, goals) }));

  } else {
    // Monthly grouping
    const monthsMap = new Map();

    logs.forEach((log) => {
      const logDate = new Date(log.logged_at);
      const key = toMonthKey(logDate);

      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          key,
          date: key,
          label: logDate.toLocaleDateString("en", { month: "long", year: "numeric" }),
          weekday: logDate.toLocaleDateString("en", { month: "short", year: "numeric" }),
          water: 0, pushups: 0, situps: 0, steps: 0, total: 0,
        });
      }

      const month = monthsMap.get(key);
      const value = Number(log.value) || 0;
      if (log.activity_type === "water") month.water += value;
      if (log.activity_type === "pushup") month.pushups += value;
      if (log.activity_type === "situp") month.situps += value;
      if (log.activity_type === "steps") month.steps += value;
      month.total += value;
    });

    periods = Array.from(monthsMap.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((p) => ({ ...p, goalHit: computeGoalHit(p, goals) }));
  }

  // ── streaks ───────────────────────────────────────────────────────────────
  const streaks = computeStreaks(periods);

  return {
    success: true,
    days: periods,      // keeping the key "days" so the history page doesn't break
    logs,
    goals,
    goalType,
    streaks,
  };
}