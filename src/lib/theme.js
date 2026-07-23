"use client";

import { usePreferences } from "@/components/PreferencesProvider";

/** Shared light/dark class bundles for app shells and cards. */
export function useThemeClasses() {
  const { preferences } = usePreferences();
  const isLight = preferences.theme === "light";

  return {
    isLight,
    waterUnit: preferences.waterUnit,
    page: isLight ? "min-h-screen bg-[#f4f4f0] text-[#121410]" : "min-h-screen bg-[#080908] text-white",
    pageAlt: isLight ? "min-h-screen bg-[#f4f4f0] text-[#121410]" : "min-h-screen bg-[#050505] text-white",
    header: isLight
      ? "border-b border-black/10 bg-[#f4f4f0]/85 backdrop-blur-2xl"
      : "border-b border-white/8 bg-black/60 backdrop-blur-2xl",
    headerSticky: isLight
      ? "sticky top-0 z-40 border-b border-black/10 bg-[#f4f4f0]/85 backdrop-blur-2xl"
      : "sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-2xl",
    card: isLight
      ? "rounded-lg border border-black/10 bg-white"
      : "rounded-lg border border-white/8 bg-white/[0.055]",
    cardSoft: isLight
      ? "rounded-2xl border border-black/10 bg-white shadow-sm"
      : "rounded-2xl border border-white/[0.07] bg-[#0f0f0f]",
    cardHover: isLight ? "hover:border-black/20" : "hover:border-white/[0.14]",
    muted: isLight ? "text-black/40" : "text-white/38",
    mutedStrong: isLight ? "text-black/55" : "text-white/45",
    faint: isLight ? "text-black/30" : "text-white/30",
    borderSubtle: isLight ? "border-black/10" : "border-white/10",
    inset: isLight ? "border border-black/10 bg-black/[0.03]" : "border border-white/8 bg-white/[0.03]",
    insetStrong: isLight ? "border border-black/10 bg-black/[0.04]" : "border border-white/10 bg-white/[0.04]",
    inputBox: isLight
      ? "rounded-xl border border-black/12 bg-white text-[#121410]"
      : "rounded-xl border border-white/10 bg-[#0a0a0a] text-white",
    chipIdle: isLight
      ? "border-black/10 bg-black/[0.03] text-black/60"
      : "border-white/[0.08] bg-white/[0.03] text-white/70",
    footerBar: isLight
      ? "border-t border-black/10 bg-[#f4f4f0]/[0.92] backdrop-blur-2xl"
      : "border-t border-white/[0.08] bg-[#050505]/[0.92] backdrop-blur-2xl",
    navLink: isLight
      ? "hidden min-h-10 items-center gap-2 rounded-md border border-black/12 px-4 text-sm font-black text-black/70 transition hover:border-[#6a9900] hover:text-[#4d7300]"
      : "hidden min-h-10 items-center gap-2 rounded-md border border-white/12 px-4 text-sm font-black text-white/80 transition hover:border-[#b7ff00] hover:text-[#b7ff00]",
    navActive: isLight ? "border-[#6a9900] text-[#4d7300]" : "border-[#b7ff00] text-[#b7ff00]",
    mobileFab: isLight
      ? "group grid size-12 place-items-center rounded-full border border-black/12 bg-white text-lg text-black/70 shadow-xl transition hover:scale-105 active:scale-95"
      : "group grid size-12 place-items-center rounded-full border border-white/12 bg-[#11130f] text-lg text-white/70 shadow-2xl shadow-black/30 transition hover:scale-105 active:scale-95",
    input: isLight
      ? "rounded-md border border-black/15 bg-black/[0.03] text-[#121410] outline-none focus:border-[#6a9900]"
      : "rounded-md border border-white/12 bg-white/[0.04] text-white outline-none focus:border-[#b7ff00]/50",
    track: isLight ? "bg-black/10" : "bg-white/[0.06]",
    orb: "pointer-events-none fixed left-0 top-0 z-0 h-[400px] w-[400px] rounded-full bg-[#b7ff00]/10 blur-[120px]",
  };
}
