"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiBell,
  FiDatabase,
  FiDownload,
  FiLock,
  FiLogOut,
  FiMonitor,
  FiMoon,
  FiShield,
  FiSliders,
  FiTarget,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import AppNav from "@/components/AppNav";
import LogoutButton from "@/app/dashboard/sign-out-button";

const preferenceCards = [
  {
    title: "Theme",
    value: "Dark",
    note: "RepFlow currently uses the focused dark theme.",
    icon: FiMoon,
  },
  {
    title: "Units",
    value: "Metric",
    note: "Water is tracked in cl and movement in reps/steps.",
    icon: FiSliders,
  },
  {
    title: "Reminders",
    value: "Coming soon",
    note: "Daily nudges will live here when notifications are added.",
    icon: FiBell,
  },
];

export default function SettingsClient({ profile }) {
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Unknown";

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed left-0 top-0 z-0 h-[420px] w-[420px] rounded-full bg-[#b7ff00]/8 blur-[120px]" />

      <AppNav sticky activePath="/settings" />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-10 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b7ff00]">Settings</p>
            <h1 className="mt-2 text-5xl font-black tracking-tighter lg:text-6xl">Account and app hub</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Manage your RepFlow account, jump into goals, and preview the app preferences that will grow in future phases.
            </p>
          </div>

          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-[#b7ff00]/10 text-xl text-[#b7ff00]">
                <FiUser />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-black">{profile.name}</p>
                <p className="truncate text-sm text-white/40">{profile.email}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">Account</h2>
                <p className="mt-1 text-sm text-white/35">Your authenticated RepFlow session.</p>
              </div>
              <FiShield className="text-2xl text-[#b7ff00]" />
            </div>

            <div className="mt-6 space-y-3">
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Provider" value={profile.provider} />
              <InfoRow label="Joined" value={joinedDate} />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div>
                <p className="text-sm font-black">Sign out</p>
                <p className="mt-1 text-xs text-white/35">End this browser session.</p>
              </div>
              <LogoutButton>
                <FiLogOut />
              </LogoutButton>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border border-[#b7ff00]/20 bg-[#b7ff00]/8 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">Daily goals</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                  Your dashboard progress uses the targets saved on the Goals page. Update water, reps, and steps there.
                </p>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#b7ff00]/15 text-2xl text-[#b7ff00]">
                <FiTarget />
              </div>
            </div>

            <Link
              href="/goals"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#b7ff00] px-5 text-sm font-black text-black transition hover:shadow-[0_0_18px_#b7ff0080]"
            >
              <FiTarget />
              Edit goals
            </Link>
          </motion.section>
        </div>

        {/* <section className="mt-4 grid gap-4 lg:grid-cols-3">
          {preferenceCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.04 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-white/[0.04] text-xl text-[#b7ff00]">
                    <Icon />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold text-white/40">
                    UI only
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                <p className="mt-1 text-sm font-bold text-[#b7ff00]">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-white/35">{item.note}</p>
              </motion.article>
            );
          })}
        </section> */}

        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-white/[0.04] text-xl text-[#b7ff00]">
                  <FiDatabase />
                </div>
                <div>
                  <h2 className="text-lg font-black">Data and privacy</h2>
                  <p className="mt-1 text-sm text-white/35">Logs and goals are stored in your Supabase account data.</p>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-white/40">
                Export and account deletion controls are planned for a later phase. For now, this section makes the storage model visible without adding new database behavior.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
              <DisabledAction icon={<FiDownload />} label="Export data" />
              <DisabledAction icon={<FiTrash2 />} label="Delete account" danger />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="flex items-start gap-3">
            <FiLock className="mt-1 shrink-0 text-xl text-[#b7ff00]" />
            <div>
              <h2 className="text-lg font-black">Security note</h2>
              <p className="mt-2 text-sm leading-6 text-white/40">
                Private routes are protected by middleware, and server actions read the current Supabase session before touching logs or goals.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-widest text-white/28">{label}</span>
      <span className="truncate text-sm font-bold text-white/70">{value || "Not set"}</span>
    </div>
  );
}

function DisabledAction({ icon, label, danger = false }) {
  return (
    <button
      type="button"
      disabled
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black opacity-55 ${danger ? "border-red-400/20 text-red-200" : "border-white/10 text-white/50"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
