"use client";

import Link from "next/link";
import { FiBarChart2, FiLogOut, FiMessageCircle, FiPlus, FiSettings, FiTarget } from "react-icons/fi";
import LogoutButton from "@/app/dashboard/sign-out-button";

const navLinkClass =
  "hidden min-h-10 items-center gap-2 rounded-md border border-white/12 px-4 text-sm font-black text-white/80 transition hover:border-[#b7ff00] hover:text-[#b7ff00]";

export default function AppNav({ sticky = false, showMobileNav = false, activePath = "" }) {
  const headerClass = sticky
    ? "sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-2xl"
    : "border-b border-white/8";

  function linkClass(href, visibility = "") {
    const isActive = activePath === href;
    return `${navLinkClass} ${visibility} ${isActive ? "border-[#b7ff00] text-[#b7ff00]" : ""}`;
  }

  return (
    <>
      <header className={headerClass}>
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/dashboard" className="text-lg font-black tracking-tight">
            <span className="text-[#b7ff00]">Rep</span>Flow
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/settings" className={`${linkClass("/settings")} lg:inline-flex`}>
              <FiSettings />
              Settings
            </Link>
            <Link href="/history" className={`${linkClass("/history")} md:inline-flex`}>
              <FiBarChart2 />
              History
            </Link>
            <Link href="/coach" className={`${linkClass("/coach")} md:inline-flex`}>
              <FiMessageCircle />
              Coach
            </Link>
            <Link href="/goals" className={`${linkClass("/goals")} sm:inline-flex`}>
              <FiTarget />
              Goals
            </Link>
            <Link href="/log" className={`${linkClass("/log")} sm:inline-flex`}>
              <FiPlus />
              Log
            </Link>

            <LogoutButton>
              <FiLogOut />
            </LogoutButton>
          </div>
        </nav>
      </header>

      {showMobileNav ? (
        <div className="fixed bottom-6 right-5 z-30 flex flex-col items-end gap-3 sm:hidden">
          <Link
            href="/settings"
            className="group grid size-12 place-items-center rounded-full border border-white/12 bg-[#11130f] text-lg text-white/70 shadow-2xl shadow-black/30 transition hover:scale-105 active:scale-95"
            aria-label="Settings"
          >
            <FiSettings className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-12" />
          </Link>
          <Link
            href="/history"
            className="group grid size-12 place-items-center rounded-full border border-white/12 bg-[#11130f] text-lg text-white/70 shadow-2xl shadow-black/30 transition hover:scale-105 active:scale-95"
            aria-label="History"
          >
            <FiBarChart2 className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-12" />
          </Link>
          <Link
            href="/coach"
            className="group grid size-12 place-items-center rounded-full border border-white/12 bg-[#11130f] text-lg text-white/70 shadow-2xl shadow-black/30 transition hover:scale-105 active:scale-95"
            aria-label="Coach"
          >
            <FiMessageCircle className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-12" />
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
      ) : null}
    </>
  );
}
