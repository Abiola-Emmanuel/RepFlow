"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiArrowLeft, FiCalendar, FiDroplet, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";
import { fetchHistoryLogs } from "@/app/actions/fetchLogs";

const ranges = [
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
];

function formatNumber(value) {
  return value.toLocaleString();
}

function periodLabel(goalType) {
  if (goalType === "weekly") return "week";
  if (goalType === "monthly") return "month";
  return "day";
}

function LoadingDots() {
  return (
    <span className="flex h-8 items-center gap-1.5">
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
          0%, 70%, 100% { transform: translateY(0); opacity: 0.45; }
          35% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

// ── Streak card ──────────────────────────────────────────────────────────────
function StreakCard({ icon, label, accent, streak, goalType, loading }) {
  const unit = goalType === "weekly" ? "wk" : goalType === "monthly" ? "mo" : "day";
  const isActive = streak > 0;

  return (
    <article
      className={`rounded-2xl border p-4 transition ${isActive
          ? "border-[#b7ff00]/25 bg-[#b7ff00]/6"
          : "border-white/[0.07] bg-[#0f0f0f]"
        }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex size-9 items-center justify-center rounded-xl bg-white/[0.04] text-lg ${accent}`}>
          {icon}
        </div>
        {isActive && !loading && (
          <span className="text-lg">🔥</span>
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/28">{label}</p>
      <div className="mt-1 flex items-end gap-1.5">
        {loading ? (
          <LoadingDots />
        ) : (
          <>
            <span className="text-2xl font-black">{streak}</span>
            <span className="pb-0.5 text-xs font-bold text-white/35">{unit} streak</span>
          </>
        )}
      </div>
      {!loading && (
        <p className="mt-1 text-[10px] text-white/25">
          {isActive ? `${streak} consecutive ${unit}${streak === 1 ? "" : "s"} hitting goal` : `No active streak`}
        </p>
      )}
    </article>
  );
}

// ── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, accent, loading }) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-4">
      <div className={`mb-4 flex size-10 items-center justify-center rounded-xl bg-white/[0.04] text-xl ${accent}`}>
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-white/28">{label}</p>
      <div className="mt-2 text-2xl font-black">{loading ? <LoadingDots /> : value}</div>
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [range, setRange] = useState(7);
  const [days, setDays] = useState([]);
  const [streaks, setStreaks] = useState({ water: 0, pushups: 0, situps: 0, steps: 0 });
  const [goalType, setGoalType] = useState("daily");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoading(true);
      setError("");

      try {
        const result = await fetchHistoryLogs({ days: range });

        if (!isMounted) return;

        if (result.error) {
          setError(result.error);
          setDays([]);
          return;
        }

        setDays(result.days);
        setStreaks(result.streaks ?? { water: 0, pushups: 0, situps: 0, steps: 0 });
        setGoalType(result.goalType ?? "daily");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load history.");
          setDays([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHistory();
    return () => { isMounted = false; };
  }, [range]);

  const totals = useMemo(
    () =>
      days.reduce(
        (sum, day) => ({
          water: sum.water + day.water,
          pushups: sum.pushups + day.pushups,
          situps: sum.situps + day.situps,
          steps: sum.steps + day.steps,
        }),
        { water: 0, pushups: 0, situps: 0, steps: 0 },
      ),
    [days],
  );

  const bestPeriod = useMemo(() => {
    if (!days.length) return null;
    return days.reduce((best, day) => (day.total > best.total ? day : best), days[0]);
  }, [days]);

  const pLabel = periodLabel(goalType);
  const breakdownTitle = goalType === "weekly"
    ? "Weekly breakdown"
    : goalType === "monthly"
      ? "Monthly breakdown"
      : "Daily breakdown";

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link href="/dashboard" className="text-xl font-black tracking-tighter">
            Rep<span className="text-[#b7ff00]">Flow</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-bold text-white/70 transition hover:border-[#b7ff00]/50 hover:text-[#b7ff00]"
          >
            <FiArrowLeft />
            Dashboard
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 lg:px-6">

        {/* ── page header ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b7ff00]">History</p>
              {!isLoading && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white/35">
                  {goalType}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-5xl font-black tracking-tighter lg:text-6xl">Your flow over time</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Review water, reps, and steps across the {range === 7 ? "week" : "month"}.
              {!isLoading && goalType !== "daily" && (
                <span className="ml-1 text-white/30">
                  Goals tracked {goalType === "weekly" ? "per week" : "per month"}.
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            {ranges.map((item) => (
              <button
                key={item.days}
                onClick={() => setRange(item.days)}
                className={`min-h-11 rounded-xl px-5 text-sm font-black transition ${range === item.days ? "bg-[#b7ff00] text-black" : "text-white/45 hover:text-white"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
            {error}
          </div>
        ) : null}

        {/* ── totals ── */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard icon={<FiDroplet />} label="Water" value={`${formatNumber(totals.water)}cl`} accent="text-sky-300" loading={isLoading} />
          <SummaryCard icon={<MdFitnessCenter />} label="Push-ups" value={formatNumber(totals.pushups)} accent="text-orange-300" loading={isLoading} />
          <SummaryCard icon={<FiTrendingUp />} label="Sit-ups" value={formatNumber(totals.situps)} accent="text-emerald-300" loading={isLoading} />
          <SummaryCard icon={<IoFootstepsOutline />} label="Steps" value={formatNumber(totals.steps)} accent="text-[#b7ff00]" loading={isLoading} />
        </div>

        {/* ── streaks ── */}
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StreakCard icon={<FiDroplet />} label="Water streak" accent="text-sky-300" streak={streaks.water} goalType={goalType} loading={isLoading} />
          <StreakCard icon={<MdFitnessCenter />} label="Push-up streak" accent="text-orange-300" streak={streaks.pushups} goalType={goalType} loading={isLoading} />
          <StreakCard icon={<FiTrendingUp />} label="Sit-up streak" accent="text-emerald-300" streak={streaks.situps} goalType={goalType} loading={isLoading} />
          <StreakCard icon={<IoFootstepsOutline />} label="Steps streak" accent="text-[#b7ff00]" streak={streaks.steps} goalType={goalType} loading={isLoading} />
        </div>

        {/* ── chart + heatmap ── */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">Activity chart</h2>
                <p className="mt-1 text-xs text-white/35">Stacked totals by {pLabel}</p>
              </div>
              <FiCalendar className="text-xl text-[#b7ff00]" />
            </div>

            <div className="h-[320px]">
              {isLoading ? (
                <div className="grid h-full place-items-center">
                  <LoadingDots />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={days} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(183,255,0,0.06)" }}
                      contentStyle={{
                        background: "#0f0f0f",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="water" stackId="activity" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pushups" stackId="activity" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="situps" stackId="activity" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="steps" stackId="activity" fill="#b7ff00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Activity map</h2>
                <p className="mt-1 text-xs text-white/35">Green ring = goal hit</p>
              </div>
              <FiRefreshCw className="text-xl text-white/30" />
            </div>

            {isLoading ? (
              <div className="grid h-56 place-items-center">
                <LoadingDots />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const allHit = day.goalHit &&
                    day.goalHit.water &&
                    day.goalHit.pushups &&
                    day.goalHit.situps &&
                    day.goalHit.steps;

                  return (
                    <div
                      key={day.date}
                      title={`${day.label}: ${formatNumber(day.total)} total${allHit ? " ✓ All goals hit!" : ""}`}
                      className={`aspect-square rounded-lg border transition ${allHit
                          ? "border-[#b7ff00]/60 ring-1 ring-[#b7ff00]/40"
                          : "border-white/8"
                        }`}
                      style={{
                        background: `rgba(183,255,0,${Math.min(0.08 + day.total / 25000, 0.85)})`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-[#b7ff00]/20 bg-[#b7ff00]/8 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b7ff00]">
                Best {pLabel}
              </p>
              <p className="mt-2 text-2xl font-black">
                {bestPeriod ? bestPeriod.label : "No logs yet"}
              </p>
              <p className="mt-1 text-sm text-white/40">
                {bestPeriod
                  ? `${formatNumber(bestPeriod.total)} total logged units`
                  : "Start logging to build your history."}
              </p>
            </div>
          </section>
        </div>

        {/* ── breakdown table ── */}
        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">{breakdownTitle}</h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/25">
              ✓ = goal hit
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-white/28">
                <tr>
                  <th className="py-3">Period</th>
                  <th className="py-3">Water</th>
                  <th className="py-3">Push-ups</th>
                  <th className="py-3">Sit-ups</th>
                  <th className="py-3">Steps</th>
                  <th className="py-3 text-right">Goals hit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/55">
                {days
                  .slice()
                  .reverse()
                  .map((day) => {
                    const gh = day.goalHit ?? {};
                    const hitCount = [gh.water, gh.pushups, gh.situps, gh.steps].filter(Boolean).length;
                    const allHit = hitCount === 4;

                    return (
                      <tr key={day.date} className={allHit ? "bg-[#b7ff00]/[0.03]" : ""}>
                        <td className="py-3 font-bold text-white/75">
                          {day.weekday ? `${day.weekday}, ` : ""}{day.label}
                        </td>
                        <td className="py-3">
                          <span className={gh.water ? "text-white/80" : ""}>{formatNumber(day.water)}cl</span>
                          {gh.water && <span className="ml-1.5 text-[#b7ff00]">✓</span>}
                        </td>
                        <td className="py-3">
                          <span className={gh.pushups ? "text-white/80" : ""}>{formatNumber(day.pushups)}</span>
                          {gh.pushups && <span className="ml-1.5 text-[#b7ff00]">✓</span>}
                        </td>
                        <td className="py-3">
                          <span className={gh.situps ? "text-white/80" : ""}>{formatNumber(day.situps)}</span>
                          {gh.situps && <span className="ml-1.5 text-[#b7ff00]">✓</span>}
                        </td>
                        <td className="py-3">
                          <span className={gh.steps ? "text-white/80" : ""}>{formatNumber(day.steps)}</span>
                          {gh.steps && <span className="ml-1.5 text-[#b7ff00]">✓</span>}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-black ${allHit
                                ? "bg-[#b7ff00]/15 text-[#b7ff00]"
                                : hitCount > 0
                                  ? "bg-white/[0.06] text-white/50"
                                  : "bg-white/[0.03] text-white/20"
                              }`}
                          >
                            {hitCount}/4
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}