"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiActivity, FiCheck, FiDroplet, FiTarget } from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";
import AppNav from "@/components/AppNav";
import { getGoals, saveGoals } from "@/app/actions/goals";
import { GoalCard } from "@/components/GoalCard";

const GOAL_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function buildGoalFields(goalType) {
  const period = goalType === "weekly" ? "Weekly" : goalType === "monthly" ? "Monthly" : "Daily";

  return [
    {
      key: "water_cl",
      label: `${period} water goal`,
      unit: "cl",
      icon: FiDroplet,
      iconBg: "#0a1a2a",
      iconColor: "#60a5fa",
      description: `How much water do you want to drink each ${goalType === "weekly" ? "week" : goalType === "monthly" ? "month" : "day"}?`,
      min: 10,
      max: goalType === "monthly" ? 30000 : goalType === "weekly" ? 7000 : 1000,
      step: goalType === "monthly" ? 100 : goalType === "weekly" ? 50 : 10,
      presets: goalType === "monthly"
        ? [5000, 6000, 7500, 9000, 10500, 12000]
        : goalType === "weekly"
          ? [1000, 1250, 1750, 2100, 2450, 2800]
          : [150, 200, 250, 300, 350, 400],
      tip: goalType === "daily"
        ? "250cl (2.5L) is the general daily recommendation."
        : goalType === "weekly"
          ? "1,750cl (17.5L) is roughly 250cl/day over a week."
          : "7,500cl (75L) is roughly 250cl/day over a month.",
    },
    {
      key: "pushups",
      label: `${period} push-up goal`,
      unit: "reps",
      icon: MdFitnessCenter,
      iconBg: "#1a0a00",
      iconColor: "#f97316",
      description: `Total push-up reps you want to hit each ${goalType === "weekly" ? "week" : goalType === "monthly" ? "month" : "day"}.`,
      min: 1,
      max: goalType === "monthly" ? 10000 : goalType === "weekly" ? 2500 : 1000,
      step: goalType === "monthly" ? 50 : goalType === "weekly" ? 25 : 5,
      presets: goalType === "monthly"
        ? [500, 750, 1000, 1500, 2000, 3000]
        : goalType === "weekly"
          ? [100, 150, 200, 350, 500, 700]
          : [20, 30, 50, 75, 100, 150],
      tip: "Start achievable — you can always raise it later.",
    },
    {
      key: "situps",
      label: `${period} sit-up goal`,
      unit: "reps",
      icon: FiActivity,
      iconBg: "#0a1a0a",
      iconColor: "#4ade80",
      description: `Total sit-up reps you want to hit each ${goalType === "weekly" ? "week" : goalType === "monthly" ? "month" : "day"}.`,
      min: 1,
      max: goalType === "monthly" ? 10000 : goalType === "weekly" ? 2500 : 1000,
      step: goalType === "monthly" ? 50 : goalType === "weekly" ? 25 : 5,
      presets: goalType === "monthly"
        ? [500, 750, 1000, 1500, 2000, 3000]
        : goalType === "weekly"
          ? [100, 150, 200, 350, 500, 700]
          : [20, 30, 50, 75, 100, 150],
      tip: "Consistency beats intensity — pick a number you can hit consistently.",
    },
    {
      key: "steps",
      label: `${period} step goal`,
      unit: "steps",
      icon: IoFootstepsOutline,
      iconBg: "#1a1a00",
      iconColor: "#b7ff00",
      description: `How many steps do you want to walk each ${goalType === "weekly" ? "week" : goalType === "monthly" ? "month" : "day"}?`,
      min: goalType === "monthly" ? 50000 : goalType === "weekly" ? 10000 : 1000,
      max: goalType === "monthly" ? 1500000 : goalType === "weekly" ? 350000 : 50000,
      step: goalType === "monthly" ? 10000 : goalType === "weekly" ? 2500 : 500,
      presets: goalType === "monthly"
        ? [150000, 200000, 300000, 400000, 500000, 600000]
        : goalType === "weekly"
          ? [35000, 52500, 70000, 87500, 105000, 140000]
          : [5000, 7500, 10000, 12500, 15000, 20000],
      tip: goalType === "daily"
        ? "10,000 steps is roughly 7–8km depending on your stride."
        : goalType === "weekly"
          ? "70,000 steps/week is roughly 10,000 steps/day."
          : "300,000 steps/month is roughly 10,000 steps/day.",
    },
  ];
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState({
    water_cl: 250,
    pushups: 50,
    situps: 50,
    steps: 10000,
    goal_type: "daily",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const goalFields = buildGoalFields(goals.goal_type);

  /* load existing goals on mount */
  useEffect(() => {
    async function load() {
      try {
        const result = await getGoals();

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.data) {
          setGoals(result.data);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load goals.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* auto-dismiss success */
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(t);
  }, [showSuccess]);

  function handleChange(key, value) {
    setGoals((prev) => ({ ...prev, [key]: value }));
  }

  function handleGoalTypeChange(type) {
    setGoals((prev) => ({ ...prev, goal_type: type }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const result = await saveGoals(goals);

      if (result.error) {
        setError(result.error);
        return;
      }

      setShowSuccess(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save goals.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* grain */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.025]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9Ii45IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] bg-repeat mix-blend-overlay" />
      </div>

      {/* ambient orb */}
      <div className="pointer-events-none fixed left-0 top-0 z-0 h-[400px] w-[400px] rounded-full bg-[#b7ff00]/8 blur-[120px]" />

      {/* navbar */}
      <AppNav sticky activePath="/goals" />

      {/* page header */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-6 pt-10 lg:px-6">
        <div className="flex flex-col gap-6">

          {/* title row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b7ff00]/10">
                <FiTarget className="text-xl text-[#b7ff00]" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter lg:text-6xl">Set your goals</h1>
                <p className="mt-1 text-sm leading-6 text-white/40">
                  Define your targets. Your dashboard will track progress against these numbers.
                </p>
              </div>
            </div>

            {/* goal type selector */}
            <div className="flex shrink-0 flex-col gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Goal period</p>
              <div className="grid grid-cols-3 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                {GOAL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleGoalTypeChange(type.value)}
                    className={`min-h-9 rounded-lg px-4 text-sm font-black transition ${goals.goal_type === type.value
                        ? "bg-[#b7ff00] text-black"
                        : "text-white/40 hover:text-white/70"
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-white/25">
                {goals.goal_type === "daily" && "Progress resets every day."}
                {goals.goal_type === "weekly" && "Progress tracked across the full week."}
                {goals.goal_type === "monthly" && "Progress tracked across the full month."}
              </p>
            </div>
          </div>

          {/* current goals summary strip */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 lg:grid-cols-4">
            {goalFields.map((f) => (
              <div
                key={f.key}
                className="flex min-h-16 items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3"
              >
                <f.icon style={{ color: f.iconColor }} className="shrink-0 text-base" />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-white/25">{f.unit}</p>
                  <p className="truncate text-sm font-black text-white/70">
                    {goals[f.key]?.toLocaleString()} {f.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* loading skeleton */}
      {loading ? (
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 pb-40 lg:grid-cols-2 lg:px-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      ) : (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-4 px-4 pb-40 lg:grid-cols-2 lg:px-6"
        >
          {goalFields.map((field) => (
            <GoalCard
              key={field.key}
              field={field}
              value={goals[field.key]}
              onChange={(v) => handleChange(field.key, v)}
            />
          ))}
        </motion.section>
      )}

      {/* error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[116px] left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-red-500/40 bg-[#0f0f0f] px-5 py-3 text-center text-sm font-black text-red-400"
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[116px] left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-[#b7ff00]/40 bg-[#0f0f0f] px-5 py-3 text-center text-sm font-black"
            style={{ color: "#b7ff00" }}
          >
            <FiCheck className="mr-2 inline" />
            Goals saved! Dashboard updated.
          </motion.div>
        )}
      </AnimatePresence>

      {/* fixed save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#050505]/[0.92] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="hidden flex-wrap gap-2 lg:flex">
            {/* goal type badge */}
            <div className="flex min-h-10 items-center gap-2 rounded-full border border-[#b7ff00]/20 bg-[#b7ff00]/8 px-3 text-xs font-black text-[#b7ff00]">
              {goals.goal_type.charAt(0).toUpperCase() + goals.goal_type.slice(1)}
            </div>
            {goalFields.map((f) => (
              <div
                key={f.key}
                className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/50"
              >
                <f.icon style={{ color: f.iconColor }} />
                {goals[f.key]?.toLocaleString()} {f.unit}
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || loading}
            className="min-h-[52px] w-full rounded-2xl text-base font-black text-black transition disabled:opacity-50"
            style={{ backgroundColor: "#b7ff00" }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                />
                Saving goals...
              </span>
            ) : (
              "Save goals"
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}