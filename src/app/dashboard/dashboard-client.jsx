"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiDroplet, FiLogOut, FiPlus, FiTrendingUp } from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";
import { fetchTodayLogs } from "@/app/log/fetchLogs";
import LogoutButton from "./sign-out-button";

const GOALS = { water: 250, pushups: 50, situps: 50, steps: 10000 };

function getPercent(value, goal) {
  return Math.min(Math.round((value / goal) * 100), 100);
}

function formatNumber(value) {
  return value.toLocaleString();
}

export default function DashboardClient({ firstName }) {
  const [totals, setTotals] = useState({ water: 0, pushups: 0, situps: 0, steps: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTodayLogs() {
      setIsLoading(true);
      setError("");

      const result = await fetchTodayLogs();

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setTotals(result.totals);
      setIsLoading(false);
    }

    loadTodayLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Water",
        value: `${formatNumber(totals.water)}cl`,
        goal: `${GOALS.water}cl`,
        percent: getPercent(totals.water, GOALS.water),
        icon: FiDroplet,
        accent: "text-sky-300",
      },
      {
        label: "Push-ups",
        value: formatNumber(totals.pushups),
        goal: `${GOALS.pushups} reps`,
        percent: getPercent(totals.pushups, GOALS.pushups),
        icon: MdFitnessCenter,
        accent: "text-orange-300",
      },
      {
        label: "Sit-ups",
        value: formatNumber(totals.situps),
        goal: `${GOALS.situps} reps`,
        percent: getPercent(totals.situps, GOALS.situps),
        icon: FiTrendingUp,
        accent: "text-[#b7ff00]",
      },
      {
        label: "Steps",
        value: formatNumber(totals.steps),
        goal: `${formatNumber(GOALS.steps)} steps`,
        percent: getPercent(totals.steps, GOALS.steps),
        icon: IoFootstepsOutline,
        accent: "text-[#b7ff00]",
      },
    ],
    [totals],
  );

  return (
    <main className="min-h-screen bg-[#080908] text-white">
      <header className="border-b border-white/8">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/dashboard" className="text-lg font-black tracking-tight">
            <span className="text-[#b7ff00]">Rep</span>Flow
          </Link>

          <div className="flex items-center gap-2">
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
              {isLoading ? "Loading today's movement..." : "Your dashboard is synced with today's saved activity logs."}
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
                  <strong className="text-4xl font-black">{isLoading ? "-" : stat.value}</strong>
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
              <span className="text-xs font-black uppercase tracking-[0.16em] text-white/28">Preview</span>
            </div>
            <div className="mt-6 grid h-56 grid-cols-7 items-end gap-3">
              {[18, 32, 24, 48, 36, 62, 44].map((height, index) => (
                <div key={index} className="flex h-full flex-col justify-end gap-2">
                  <div className="rounded-t-md bg-[#b7ff00]/80" style={{ height: `${height}%` }} />
                  <span className="text-center text-xs text-white/30">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                </div>
              ))}
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

      <Link
        href="/log"
        className="fixed bottom-6 right-6 grid size-14 place-items-center rounded-full bg-[#b7ff00] text-xl text-black shadow-2xl shadow-[#b7ff00]/20 transition hover:scale-105 sm:hidden"
        aria-label="Log today"
      >
        <FiPlus />
      </Link>
    </main>
  );
}
