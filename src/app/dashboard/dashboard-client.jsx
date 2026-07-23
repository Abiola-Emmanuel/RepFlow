"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiDroplet, FiTrendingUp, FiZap } from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";
import { fetchHistoryLogs, fetchTodayLogs } from "@/app/actions/fetchLogs";
import { getGoals } from "@/app/actions/goals";
import AppNav from "@/components/AppNav";
import CoachInsightCard from "@/components/CoachInsightCard";
import { usePreferences } from "@/components/PreferencesProvider";
import { formatWater } from "@/lib/preferences";
import { useThemeClasses } from "@/lib/theme";

const DEFAULT_GOALS = { water_cl: 250, pushups: 50, situps: 50, steps: 10000 };
const DEFAULT_STREAKS = { water: 0, pushups: 0, situps: 0, steps: 0 };

function getPercent(value, goal) {
  if (!goal || goal <= 0) {
    return 0;
  }

  return Math.min(Math.round((value / goal) * 100), 100);
}

function formatNumber(value) {
  return value.toLocaleString();
}

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

function LoadingDots({ label }) {
  return (
    <span className="flex h-10 w-20 items-center gap-1.5" aria-label={`Loading ${label}`} role="status">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-2 rounded-full bg-[#b7ff00]"
          style={{
            animation: "dotWave 900ms ease-in-out infinite",
            animationDelay: `${dot * 140}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes dotWave {
          0%,
          70%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          35% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
}

export default function DashboardClient({ firstName }) {
  const { preferences } = usePreferences();
  const theme = useThemeClasses();
  const [totals, setTotals] = useState({ water: 0, pushups: 0, situps: 0, steps: 0 });
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [weekDays, setWeekDays] = useState([]);
  const [streaks, setStreaks] = useState(DEFAULT_STREAKS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTodayLogs() {
      setIsLoading(true);
      setError("");

      try {
        const [logsResult, goalsResult, historyResult] = await Promise.allSettled([
          fetchTodayLogs(getLocalTodayRange()),
          getGoals(),
          fetchHistoryLogs({ days: 7, forceDaily: true }),
        ]);

        if (!isMounted) {
          return;
        }

        const errors = [];

        if (logsResult.status === "fulfilled" && !logsResult.value.error) {
          setTotals(logsResult.value.totals);
        } else {
          errors.push(logsResult.status === "fulfilled" ? logsResult.value.error : "Could not load today's logs.");
        }

        if (goalsResult.status === "fulfilled" && !goalsResult.value.error) {
          setGoals(goalsResult.value.data || DEFAULT_GOALS);
        } else {
          setGoals(DEFAULT_GOALS);
          errors.push(goalsResult.status === "fulfilled" ? goalsResult.value.error : "Could not load your goals.");
        }

        if (historyResult.status === "fulfilled" && !historyResult.value.error) {
          setWeekDays(historyResult.value.days ?? []);
          setStreaks(historyResult.value.streaks ?? DEFAULT_STREAKS);
        } else {
          setWeekDays([]);
          setStreaks(DEFAULT_STREAKS);
          errors.push(historyResult.status === "fulfilled" ? historyResult.value.error : "Could not load weekly history.");
        }

        setError(errors.filter(Boolean).join(" "));
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load dashboard data.");
          setGoals(DEFAULT_GOALS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTodayLogs();
    window.addEventListener("focus", loadTodayLogs);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", loadTodayLogs);
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Water",
        value: formatWater(totals.water, preferences.waterUnit),
        goal: formatWater(goals.water_cl, preferences.waterUnit),
        percent: getPercent(totals.water, goals.water_cl),
        icon: FiDroplet,
        accent: "text-sky-300",
      },
      {
        label: "Push-ups",
        value: formatNumber(totals.pushups),
        goal: `${formatNumber(goals.pushups)} reps`,
        percent: getPercent(totals.pushups, goals.pushups),
        icon: MdFitnessCenter,
        accent: "text-orange-300",
      },
      {
        label: "Sit-ups",
        value: formatNumber(totals.situps),
        goal: `${formatNumber(goals.situps)} reps`,
        percent: getPercent(totals.situps, goals.situps),
        icon: FiTrendingUp,
        accent: "text-[#b7ff00]",
      },
      {
        label: "Steps",
        value: formatNumber(totals.steps),
        goal: `${formatNumber(goals.steps)} steps`,
        percent: getPercent(totals.steps, goals.steps),
        icon: IoFootstepsOutline,
        accent: "text-[#b7ff00]",
      },
    ],
    [totals, goals, preferences.waterUnit],
  );

  const weeklyChart = useMemo(() => {
    const maxTotal = Math.max(...weekDays.map((day) => day.total), 1);

    return weekDays.map((day) => ({
      key: day.key,
      label: day.weekday?.charAt(0) ?? "",
      height: day.total > 0 ? Math.max(Math.round((day.total / maxTotal) * 100), 8) : 0,
      total: day.total,
    }));
  }, [weekDays]);

  const bestStreak = Math.max(streaks.water, streaks.pushups, streaks.situps, streaks.steps, 0);
  const goalsHitToday = stats.filter((stat) => !isLoading && stat.percent >= 100).length;

  const milestones = useMemo(() => {
    const items = [];
    if (bestStreak >= 3) {
      items.push({ label: `${bestStreak}-day best streak`, tone: "hot" });
    }
    if (goalsHitToday > 0) {
      items.push({ label: `${goalsHitToday}/4 goals hit today`, tone: "good" });
    }
    if (weekDays.some((day) => day.total > 0)) {
      items.push({ label: "Logged this week", tone: "neutral" });
    }
    if (items.length === 0) {
      items.push({ label: "Log today to start a streak", tone: "neutral" });
    }
    return items.slice(0, 3);
  }, [bestStreak, goalsHitToday, weekDays]);

  const streakCards = [
    { key: "water", label: "Water", value: streaks.water, icon: FiDroplet },
    { key: "pushups", label: "Push-ups", value: streaks.pushups, icon: MdFitnessCenter },
    { key: "situps", label: "Sit-ups", value: streaks.situps, icon: FiTrendingUp },
    { key: "steps", label: "Steps", value: streaks.steps, icon: IoFootstepsOutline },
  ];

  const surface = theme.isLight
    ? "rounded-lg border border-black/10 bg-white"
    : "rounded-lg border border-white/8 bg-white/[0.055]";

  return (
    <main className={theme.page}>
      <AppNav activePath="/dashboard" showMobileNav />

      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b7ff00]">Today</p>
            <h1 className="mt-2 text-4xl font-black tracking-normal sm:text-5xl">Welcome back, {firstName}.</h1>
            <p className={`mt-3 max-w-xl text-sm leading-6 ${theme.muted}`}>
              {isLoading ? "Loading today's movement and goals..." : "Your dashboard is synced with today's logs and your saved goals."}
            </p>
            {error ? <p className="mt-2 text-sm font-bold text-red-400">{error}</p> : null}
          </div>
          <div className={`${surface} px-4 py-3 text-sm ${theme.mutedStrong}`}>
            {new Date().toLocaleDateString("en", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {milestones.map((item) => (
            <span
              key={item.label}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                item.tone === "hot"
                  ? "border-[#b7ff00]/40 bg-[#b7ff00]/12 text-[#b7ff00]"
                  : item.tone === "good"
                    ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
                    : "border-white/10 bg-white/[0.04] text-white/45"
              }`}
            >
              <FiZap className="text-sm" />
              {item.label}
            </span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article key={stat.label} className={`${surface} p-5`}>
                <div className="flex items-center justify-between">
                  <div className={`flex size-11 items-center justify-center rounded-lg ${theme.isLight ? "bg-black/5" : "bg-white/6"} ${stat.accent}`}>
                    <Icon className="text-xl" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-[0.16em] ${theme.muted}`}>Goal</span>
                </div>
                <p className={`mt-6 text-sm font-bold ${theme.mutedStrong}`}>{stat.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  {isLoading ? (
                    <LoadingDots label={stat.label} />
                  ) : (
                    <strong className="text-4xl font-black">{stat.value}</strong>
                  )}
                  <span className={`pb-1 text-sm ${theme.muted}`}>{stat.goal}</span>
                </div>
                <div className={`mt-5 h-2 overflow-hidden rounded-full ${theme.isLight ? "bg-black/10" : "bg-white/8"}`}>
                  <div className="h-full rounded-full bg-[#b7ff00] transition-all duration-500" style={{ width: `${isLoading ? 0 : stat.percent}%` }} />
                </div>
              </article>
            );
          })}
        </div>

        <section className={`mt-8 ${surface} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Streaks</h2>
              <p className={`mt-1 text-sm ${theme.muted}`}>Consecutive days you hit each goal.</p>
            </div>
            <span className="rounded-full border border-[#b7ff00]/30 bg-[#b7ff00]/10 px-3 py-1 text-xs font-black text-[#b7ff00]">
              Best {isLoading ? "—" : bestStreak}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {streakCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className={`rounded-lg border px-4 py-4 ${
                    theme.isLight ? "border-black/10 bg-black/[0.03]" : "border-white/8 bg-black/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="text-[#b7ff00]" />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.muted}`}>days</span>
                  </div>
                  <p className={`mt-4 text-sm ${theme.mutedStrong}`}>{card.label}</p>
                  <p className="mt-1 text-3xl font-black">{isLoading ? "—" : card.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <section className={`${surface} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Weekly flow</h2>
              <Link href="/history" className="text-xs font-black uppercase tracking-[0.16em] text-[#b7ff00]">
                View history
              </Link>
            </div>
            <div className="mt-6 grid h-56 grid-cols-7 items-end gap-3">
              {isLoading ? (
                [0, 1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="flex h-full flex-col justify-end gap-2">
                    <div className="animate-pulse rounded-t-md bg-white/10" style={{ height: "30%" }} />
                    <span className="text-center text-xs text-white/20">—</span>
                  </div>
                ))
              ) : weeklyChart.length > 0 ? (
                weeklyChart.map((day) => (
                  <div key={day.key} className="flex h-full flex-col justify-end gap-2">
                    <div
                      className="rounded-t-md bg-[#b7ff00]/80 transition-all duration-500"
                      style={{ height: `${day.height}%` }}
                      title={`${day.total.toLocaleString()} total logged`}
                    />
                    <span className={`text-center text-xs ${theme.muted}`}>{day.label}</span>
                  </div>
                ))
              ) : (
                [0, 1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="flex h-full flex-col justify-end gap-2">
                    <div className={`rounded-t-md ${theme.isLight ? "bg-black/10" : "bg-white/[0.06]"}`} style={{ height: "4%" }} />
                    <span className={`text-center text-xs ${theme.muted}`}>{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <CoachInsightCard />
        </div>
      </section>
    </main>
  );
}
