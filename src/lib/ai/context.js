import { createClient } from "@/lib/supabase/server";
import { fetchHistoryLogs, fetchTodayLogs } from "@/app/actions/fetchLogs";
import { getGoals } from "@/app/actions/goals";

const DEFAULT_GOALS = { water_cl: 250, pushups: 50, situps: 50, steps: 10000, goal_type: "daily" };

function getLocalTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function getPercent(value, goal) {
  if (!goal || goal <= 0) {
    return 0;
  }

  return Math.min(Math.round((value / goal) * 100), 100);
}

export async function buildFitnessContext() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const userName =
    user.user_metadata?.full_name?.split(" ")?.[0] ||
    user.email?.split("@")?.[0] ||
    "there";

  const [logsResult, goalsResult, historyResult] = await Promise.allSettled([
    fetchTodayLogs(getLocalTodayRange()),
    getGoals(),
    fetchHistoryLogs({ days: 7, forceDaily: true }),
  ]);

  const todayTotals =
    logsResult.status === "fulfilled" && !logsResult.value.error
      ? logsResult.value.totals
      : { water: 0, pushups: 0, situps: 0, steps: 0 };

  const goals =
    goalsResult.status === "fulfilled" && !goalsResult.value.error
      ? goalsResult.value.data || DEFAULT_GOALS
      : DEFAULT_GOALS;

  const history =
    historyResult.status === "fulfilled" && !historyResult.value.error
      ? historyResult.value
      : { days: [], streaks: { water: 0, pushups: 0, situps: 0, steps: 0 } };

  const todayProgress = {
    water: getPercent(todayTotals.water, goals.water_cl),
    pushups: getPercent(todayTotals.pushups, goals.pushups),
    situps: getPercent(todayTotals.situps, goals.situps),
    steps: getPercent(todayTotals.steps, goals.steps),
  };

  const last7Days = (history.days ?? []).map((day) => ({
    date: day.date,
    label: day.label,
    water: day.water,
    pushups: day.pushups,
    situps: day.situps,
    steps: day.steps,
    goalHit: day.goalHit,
  }));

  return {
    success: true,
    context: {
      userName,
      goals: {
        water_cl: goals.water_cl,
        pushups: goals.pushups,
        situps: goals.situps,
        steps: goals.steps,
        goal_type: goals.goal_type ?? "daily",
      },
      today: todayTotals,
      todayProgress,
      streaks: history.streaks ?? { water: 0, pushups: 0, situps: 0, steps: 0 },
      last7Days,
    },
  };
}
