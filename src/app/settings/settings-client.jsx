"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiBell,
  FiDatabase,
  FiDownload,
  FiLock,
  FiLogOut,
  FiMoon,
  FiShield,
  FiSliders,
  FiSun,
  FiTarget,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import AppNav from "@/components/AppNav";
import SegmentedControl from "@/components/SegmentedControl";
import LogoutButton from "@/app/dashboard/sign-out-button";
import { usePreferences } from "@/components/PreferencesProvider";
import { updateProfileMetadata } from "@/app/actions/profile";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export default function SettingsClient({ profile }) {
  const { preferences, updatePreferences } = usePreferences();
  const [username, setUsername] = useState(profile.username || "");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const isLight = preferences.theme === "light";

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  async function handleSaveUsername(event) {
    event.preventDefault();
    setUsernameStatus("");

    if (!USERNAME_PATTERN.test(username.trim())) {
      setUsernameStatus("Username must be 3–20 characters (letters, numbers, underscores).");
      return;
    }

    setSavingUsername(true);
    const result = await updateProfileMetadata({ username: username.trim() });
    setSavingUsername(false);

    if (result.error) {
      setUsernameStatus(result.error);
      return;
    }

    setUsernameStatus("Username saved.");
  }

  const shell = isLight ? "bg-[#f4f4f0] text-[#121410]" : "bg-[#050505] text-white";
  const card = isLight
    ? "rounded-2xl border border-black/10 bg-white p-5"
    : "rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5";
  const muted = isLight ? "text-black/40" : "text-white/35";
  const row = isLight
    ? "rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3"
    : "rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3";

  return (
    <main className={`min-h-screen ${shell}`}>
      <div className="pointer-events-none fixed left-0 top-0 z-0 h-[420px] w-[420px] rounded-full bg-[#b7ff00]/8 blur-[120px]" />

      <AppNav sticky activePath="/settings" />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-10 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b7ff00]">Settings</p>
            <h1 className="mt-2 text-5xl font-black tracking-tighter lg:text-6xl">Account and preferences</h1>
            <p className={`mt-3 max-w-2xl text-sm leading-6 ${muted}`}>
              Manage your profile, theme, units, and reminder preferences.
            </p>
          </div>

          <section className={isLight ? "rounded-2xl border border-black/10 bg-white p-4" : "rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"}>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-[#b7ff00]/10 text-xl text-[#b7ff00]">
                <FiUser />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-black">{profile.username || profile.name}</p>
                <p className={`truncate text-sm ${muted}`}>{profile.email}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">Account</h2>
                <p className={`mt-1 text-sm ${muted}`}>Your authenticated RepFlow session.</p>
              </div>
              <FiShield className="text-2xl text-[#b7ff00]" />
            </div>

            <form onSubmit={handleSaveUsername} className="mt-6 space-y-3">
              <label className="block">
                <span className={`text-xs font-bold uppercase tracking-widest ${muted}`}>Username</span>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className={`min-h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:border-[#b7ff00] ${
                      isLight ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={savingUsername}
                    className="min-h-11 rounded-xl bg-[#b7ff00] px-4 text-sm font-black text-black disabled:opacity-55"
                  >
                    {savingUsername ? "..." : "Save"}
                  </button>
                </div>
              </label>
              {usernameStatus ? (
                <p className={`text-sm ${usernameStatus.includes("saved") ? "text-[#b7ff00]" : "text-red-300"}`}>
                  {usernameStatus}
                </p>
              ) : null}
            </form>

            <div className="mt-4 space-y-3">
              <InfoRow label="Email" value={profile.email} className={row} muted={muted} />
              <InfoRow label="Provider" value={profile.provider} className={row} muted={muted} />
              <InfoRow label="Joined" value={joinedDate} className={row} muted={muted} />
            </div>

            <div className={`mt-6 flex items-center justify-between p-4 ${row}`}>
              <div>
                <p className="text-sm font-black">Sign out</p>
                <p className={`mt-1 text-xs ${muted}`}>End this browser session.</p>
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
                <p className={`mt-2 max-w-xl text-sm leading-6 ${muted}`}>
                  Your dashboard progress uses the targets saved on the Goals page.
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

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#b7ff00]/10 text-xl text-[#b7ff00]">
                {preferences.theme === "light" ? <FiSun /> : <FiMoon />}
              </div>
              <div>
                <h3 className="text-lg font-black">Theme</h3>
                <p className={`mt-1 text-xs leading-5 ${muted}`}>Dark or light surfaces.</p>
              </div>
            </div>
            <SegmentedControl
              value={preferences.theme}
              onChange={(theme) => updatePreferences({ theme })}
              layoutId="settings-theme-pill"
              size="sm"
              options={[
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
              ]}
            />
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#b7ff00]/10 text-xl text-[#b7ff00]">
                <FiSliders />
              </div>
              <div>
                <h3 className="text-lg font-black">Water units</h3>
                <p className={`mt-1 text-xs leading-5 ${muted}`}>
                  Display only — logs and goals stay stored in cl.
                </p>
              </div>
            </div>
            <SegmentedControl
              value={preferences.waterUnit}
              onChange={(waterUnit) => updatePreferences({ waterUnit })}
              layoutId="settings-units-pill"
              size="sm"
              options={[
                { value: "cl", label: "cl" },
                { value: "ml", label: "ml" },
                { value: "oz", label: "oz" },
              ]}
            />
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#b7ff00]/10 text-xl text-[#b7ff00]">
                <FiBell />
              </div>
              <div>
                <h3 className="text-lg font-black">Reminders</h3>
                <p className={`mt-1 text-xs leading-5 ${muted}`}>
                  Preference only for now — no push/browser alerts yet.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <SegmentedControl
                value={preferences.remindersEnabled ? "on" : "off"}
                onChange={(value) => updatePreferences({ remindersEnabled: value === "on" })}
                layoutId="settings-reminders-pill"
                size="sm"
                options={[
                  { value: "off", label: "Off" },
                  { value: "on", label: "On" },
                ]}
              />
              <label className="block">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>Daily time</span>
                <input
                  type="time"
                  value={preferences.reminderTime}
                  disabled={!preferences.remindersEnabled}
                  onChange={(event) => updatePreferences({ reminderTime: event.target.value })}
                  className={`mt-2 min-h-10 w-full rounded-lg border px-3 text-sm outline-none disabled:opacity-40 ${
                    isLight ? "border-black/10 bg-black/[0.04]" : "border-white/10 bg-black/30"
                  }`}
                />
              </label>
            </div>
          </div>
        </section>

        <section className={`mt-4 ${card}`}>
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-[#b7ff00]/10 text-xl text-[#b7ff00]">
                  <FiDatabase />
                </div>
                <div>
                  <h2 className="text-lg font-black">Data and privacy</h2>
                  <p className={`mt-1 text-sm ${muted}`}>Logs and goals are stored in your Supabase account data.</p>
                </div>
              </div>
              <p className={`max-w-2xl text-sm leading-6 ${muted}`}>
                Export and account deletion controls are planned for a later phase.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
              <DisabledAction icon={<FiDownload />} label="Export data" />
              <DisabledAction icon={<FiTrash2 />} label="Delete account" danger />
            </div>
          </div>
        </section>

        <section className={`mt-4 ${isLight ? "rounded-2xl border border-black/10 bg-white p-5" : "rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"}`}>
          <div className="flex items-start gap-3">
            <FiLock className="mt-1 shrink-0 text-xl text-[#b7ff00]" />
            <div>
              <h2 className="text-lg font-black">Security note</h2>
              <p className={`mt-2 text-sm leading-6 ${muted}`}>
                Private routes are protected by middleware, and server actions read the current Supabase session before touching logs or goals.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoRow({ label, value, className, muted }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <span className={`text-xs font-bold uppercase tracking-widest ${muted}`}>{label}</span>
      <span className="truncate text-sm font-bold opacity-80">{value || "Not set"}</span>
    </div>
  );
}

function DisabledAction({ icon, label, danger = false }) {
  return (
    <button
      type="button"
      disabled
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black opacity-55 ${
        danger ? "border-red-400/20 text-red-200" : "border-white/10 text-white/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
