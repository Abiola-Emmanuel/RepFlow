"use client";

import Link from "next/link";
import { FiBarChart2, FiLogOut, FiMessageCircle, FiPlus, FiSettings, FiTarget } from "react-icons/fi";
import LogoutButton from "@/app/dashboard/sign-out-button";
import { useThemeClasses } from "@/lib/theme";

export default function AppNav({ sticky = false, showMobileNav = false, activePath = "" }) {
  const theme = useThemeClasses();
  const headerClass = sticky ? theme.headerSticky : theme.header;

  function linkClass(href, visibility = "") {
    const isActive = activePath === href;
    return `${theme.navLink} ${visibility} ${isActive ? theme.navActive : ""}`;
  }

  return (
    <>
      <header className={headerClass}>
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:h-16">
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
          <Link href="/settings" className={theme.mobileFab} aria-label="Settings">
            <FiSettings className="transition-transform duration-200 group-hover:rotate-12" />
          </Link>
          <Link href="/history" className={theme.mobileFab} aria-label="History">
            <FiBarChart2 className="transition-transform duration-200 group-hover:rotate-12" />
          </Link>
          <Link href="/coach" className={theme.mobileFab} aria-label="Coach">
            <FiMessageCircle className="transition-transform duration-200 group-hover:rotate-12" />
          </Link>
          <Link
            href="/goals"
            className={`${theme.mobileFab} ${theme.isLight ? "text-[#4d7300]" : "text-[#b7ff00]"}`}
            aria-label="Goals"
          >
            <FiTarget className="transition-transform duration-200 group-hover:rotate-12" />
          </Link>
          <Link
            href="/log"
            className="group grid size-14 place-items-center rounded-full bg-[#b7ff00] text-xl text-black shadow-2xl shadow-[#b7ff00]/20 transition hover:scale-105 active:scale-95"
            aria-label="Log today"
          >
            <FiPlus className="transition-transform duration-200 group-hover:rotate-12" />
          </Link>
        </div>
      ) : null}
    </>
  );
}
