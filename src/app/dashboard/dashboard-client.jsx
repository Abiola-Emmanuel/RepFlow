"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiBarChart2, FiDroplet, FiLogOut, FiPlus, FiTarget, FiTrendingUp } from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";
import { fetchHistoryLogs, fetchTodayLogs } from "@/app/actions/fetchLogs";
import { getGoals } from "@/app/actions/goals";
import LogoutButton from "./sign-out-button";

const DEFAULT_GOALS = { water_cl: 250, pushups: 50, situps: 50, steps: 10000 };

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
  const [totals, setTotals] = useState({ water: 0, pushups: 0, situps: 0, steps: 0 });
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [weekDays, setWeekDays] = useState([]);
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
        } else {
          setWeekDays([]);
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
        value: `${formatNumber(totals.water)}cl`,
        goal: `${formatNumber(goals.water_cl)}cl`,
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
    [totals, goals],
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

  return (
    <main className="min-h-screen bg-[#080908] text-white">
      <header className="border-b border-white/8">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/dashboard" className="text-lg font-black tracking-tight">
            <span className="text-[#b7ff00]">Rep</span>Flow
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/history"
              className="hidden min-h-10 items-center gap-2 rounded-md border border-white/12 px-4 text-sm font-black text-white/80 transition hover:border-[#b7ff00] hover:text-[#b7ff00] md:inline-flex"
            >
              <FiBarChart2 />
              History
            </Link>
            <Link
              href="/goals"
              className="hidden min-h-10 items-center gap-2 rounded-md border border-white/12 px-4 text-sm font-black text-white/80 transition hover:border-[#b7ff00] hover:text-[#b7ff00] sm:inline-flex"
            >
              <FiTarget />
              Goals
            </Link>
            <Link
              href="/log"
              className="hidden min-h-10 items-center gap-2 rounded-md border border-white/12 px-4 text-sm font-black text-white/80 transition hover:border-[#b7ff00] hover:text-[#b7ff00] sm:inline-flex"
            >
              <FiPlus />
              Log
            </Link>

            <LogoutButton>
              <FiLogOut />
            </LogoutButton>
          </div>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b7ff00]">Today</p>
            <h1 className="mt-2 text-4xl font-black tracking-normal sm:text-5xl">Welcome back, {firstName}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/38">
              {isLoading ? "Loading today's movement and goals..." : "Your dashboard is synced with today's logs and your saved goals."}
            </p>
            {error ? <p className="mt-2 text-sm font-bold text-red-300">{error}</p> : null}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/45">
            {new Date().toLocaleDateString("en", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article key={stat.label} className="rounded-lg border border-white/8 bg-white/[0.055] p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex size-11 items-center justify-center rounded-lg bg-white/6 ${stat.accent}`}>
                    <Icon className="text-xl" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-white/28">Goal</span>
                </div>
                <p className="mt-6 text-sm font-bold text-white/42">{stat.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  {isLoading ? (
                    <LoadingDots label={stat.label} />
                  ) : (
                    <strong className="text-4xl font-black">{stat.value}</strong>
                  )}
                  <span className="pb-1 text-sm text-white/35">{stat.goal}</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[#b7ff00] transition-all duration-500" style={{ width: `${isLoading ? 0 : stat.percent}%` }} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-lg border border-white/8 bg-white/[0.055] p-5">
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
                    <span className="text-center text-xs text-white/30">{day.label}</span>
                  </div>
                ))
              ) : (
                [0, 1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="flex h-full flex-col justify-end gap-2">
                    <div className="rounded-t-md bg-white/[0.06]" style={{ height: "4%" }} />
                    <span className="text-center text-xs text-white/30">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[#b7ff00]/20 bg-[#b7ff00]/8 p-5">
            <h2 className="text-lg font-black">Next move</h2>
            <p className="mt-3 text-sm leading-6 text-white/48">
              Log another set or add your steps. The dashboard will pull your saved totals when you come back.
            </p>
            <Link
              href="/log"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#b7ff00] px-4 text-sm font-black text-black"
            >
              <FiPlus />
              Log today
            </Link>
          </section>
        </div>
      </section>

      <div className="fixed bottom-6 right-5 z-30 flex flex-col items-end gap-3 sm:hidden">
        <Link
          href="/history"
          className="group grid size-12 place-items-center rounded-full border border-white/12 bg-[#11130f] text-lg text-white/70 shadow-2xl shadow-black/30 transition hover:scale-105 active:scale-95"
          aria-label="History"
        >
          <FiBarChart2 className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-12" />
        </Link>
        <Link
          href="/goals"
          className="group grid size-12 place-items-center rounded-full border border-white/12 bg-[#11130f] text-lg text-[#b7ff00] shadow-2xl shadow-black/30 transition hover:scale-105 active:scale-95"
          aria-label="Goals"
        >
          <FiTarget className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-12" />
        </Link>
        <Link
          href="/log"
          className="group grid size-14 place-items-center rounded-full bg-[#b7ff00] text-xl text-black shadow-2xl shadow-[#b7ff00]/20 transition hover:scale-105 active:scale-95"
          aria-label="Log today"
        >
          <FiPlus className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-12" />
        </Link>
      </div>
    </main>
  );
}
