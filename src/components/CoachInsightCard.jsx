"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiMessageCircle, FiPlus, FiRefreshCw } from "react-icons/fi";
import { getDailyInsight } from "@/app/actions/coach";

const FALLBACK_INSIGHT =
  "Log your water, reps, and steps today — your coach gets smarter as you track more activity.";

function getInsightCacheKey() {
  return `repflow-insight-${new Date().toISOString().slice(0, 10)}`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 animate-pulse rounded bg-white/10" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
      <div className="h-3 w-3/5 animate-pulse rounded bg-white/10" />
    </div>
  );
}

export default function CoachInsightCard() {
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInsight(force = false) {
    const cacheKey = getInsightCacheKey();

    if (!force) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setInsight(cached);
          setIsLoading(false);
          return;
        }
      } catch {
        // sessionStorage unavailable — continue to fetch
      }
    }

    setIsLoading(true);
    setError("");

    const result = await getDailyInsight();

    if (result.error) {
      setError(result.error);
      setInsight(FALLBACK_INSIGHT);
    } else {
      const text = result.insight || FALLBACK_INSIGHT;
      setInsight(text);

      try {
        sessionStorage.setItem(cacheKey, text);
      } catch {
        // ignore cache write failures
      }
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadInsight();
  }, []);

  return (
    <section className="rounded-lg border border-[#b7ff00]/20 bg-[#b7ff00]/8 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">Coach insight</h2>
        {!isLoading && error ? (
          <button
            type="button"
            onClick={() => loadInsight(true)}
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#b7ff00]"
          >
            <FiRefreshCw />
            Retry
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <p className="text-sm leading-6 text-white/60">{insight}</p>
        )}
      </div>

      {error && !isLoading ? (
        <p className="mt-2 text-xs text-white/35">Using fallback tip — coach will reconnect when available.</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/coach"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#b7ff00]/40 bg-[#b7ff00]/10 px-4 text-sm font-black text-[#b7ff00] transition hover:bg-[#b7ff00]/20"
        >
          <FiMessageCircle />
          Ask coach
        </Link>
        <Link
          href="/log"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#b7ff00] px-4 text-sm font-black text-black"
        >
          <FiPlus />
          Log today
        </Link>
      </div>
    </section>
  );
}
