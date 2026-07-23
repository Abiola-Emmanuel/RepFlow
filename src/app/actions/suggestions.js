"use server";

import { buildFitnessContext } from "@/lib/ai/context";
import { getGoals, saveGoals } from "@/app/actions/goals";

function bumpValue(current, percent = 0.1) {
  const next = Math.round(current * (1 + percent));
  return Math.max(current + 1, next);
}

/**
 * Soft goal suggestions based on recent progress — confirm before applying.
 */
export async function getCoachSoftSuggestions() {
  try {
    const result = await buildFitnessContext();

    if (result.error) {
      return { error: result.error };
    }

    const { context } = result;
    const suggestions = [];

    const checks = [
      {
        key: "pushups",
        label: "push-ups",
        progress: context.todayProgress.pushups,
        streak: context.streaks.pushups,
        current: context.goals.pushups,
        unit: "reps",
      },
      {
        key: "situps",
        label: "sit-ups",
        progress: context.todayProgress.situps,
        streak: context.streaks.situps,
        current: context.goals.situps,
        unit: "reps",
      },
      {
        key: "water_cl",
        label: "water",
        progress: context.todayProgress.water,
        streak: context.streaks.water,
        current: context.goals.water_cl,
        unit: "cl",
      },
      {
        key: "steps",
        label: "steps",
        progress: context.todayProgress.steps,
        streak: context.streaks.steps,
        current: context.goals.steps,
        unit: "steps",
      },
    ];

    for (const item of checks) {
      if (item.progress >= 100 || item.streak >= 3) {
        const proposed = bumpValue(item.current, item.key === "steps" ? 0.05 : 0.1);
        suggestions.push({
          id: `bump-${item.key}`,
          type: "goal_bump",
          key: item.key,
          label: item.label,
          unit: item.unit,
          current: item.current,
          proposed,
          reason:
            item.progress >= 100
              ? `You already hit today's ${item.label} goal — ready for a small bump?`
              : `Your ${item.label} streak is ${item.streak}. A slight increase keeps you growing.`,
        });
      }
    }

    if (suggestions.length === 0 && context.todayProgress.water < 50) {
      suggestions.push({
        id: "focus-water",
        type: "focus",
        key: "water_cl",
        label: "water",
        message: "Hydration is behind — log a glass now, then ask me for a plan.",
      });
    }

    return { success: true, suggestions: suggestions.slice(0, 3) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not load suggestions." };
  }
}

export async function applyGoalSuggestion({ key, proposed }) {
  const goalsResult = await getGoals();

  if (goalsResult.error) {
    return { error: goalsResult.error };
  }

  const goals = { ...goalsResult.data };

  if (!(key in goals)) {
    return { error: "Unknown goal field." };
  }

  const value = Number(proposed);
  if (!Number.isFinite(value) || value <= 0) {
    return { error: "Invalid proposed goal." };
  }

  goals[key] = Math.round(value);

  return saveGoals(goals);
}
