"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiActivity, FiArrowRight, FiCheck, FiDroplet, FiUser } from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";
import SegmentedControl from "@/components/SegmentedControl";
import { completeOnboarding } from "@/app/actions/profile";
import { useThemeClasses } from "@/lib/theme";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const DEFAULT_GOALS = {
  water_cl: 250,
  pushups: 50,
  situps: 50,
  steps: 10000,
  goal_type: "daily",
};

export default function OnboardingClient({ initialUsername = "", needsUsername = true }) {
  const router = useRouter();
  const theme = useThemeClasses();
  const [step, setStep] = useState(needsUsername ? 0 : 1);
  const [username, setUsername] = useState(initialUsername);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const steps = useMemo(
    () =>
      needsUsername
        ? [
            { key: "username", title: "Pick a username", icon: FiUser },
            { key: "goals", title: "Set your targets", icon: FiActivity },
            { key: "done", title: "You're ready", icon: FiCheck },
          ]
        : [
            { key: "goals", title: "Set your targets", icon: FiActivity },
            { key: "done", title: "You're ready", icon: FiCheck },
          ],
    [needsUsername],
  );

  const visualStep = needsUsername ? step : step - 1;

  async function handleFinish() {
    setStatus("");
    setSaving(true);

    try {
      const result = await completeOnboarding({
        username: needsUsername || username ? username.trim() : undefined,
        goals,
      });

      if (result.error) {
        setStatus(result.error);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not finish onboarding.");
    } finally {
      setSaving(false);
    }
  }

  function goNextFromUsername() {
    setStatus("");

    if (!USERNAME_PATTERN.test(username.trim())) {
      setStatus("Username must be 3–20 characters (letters, numbers, underscores).");
      return;
    }

    setStep(1);
  }

  const showingUsername = needsUsername && step === 0;
  const showingGoals = step === 1;
  const showingDone = step >= 2;

  return (
    <main className={`${theme.page} flex flex-col px-4 py-4 sm:px-5 sm:py-6 lg:py-5`}>
      <div className={theme.orb} />

      <section className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
        <p className="text-center text-lg font-black tracking-tight sm:text-xl">
          <span className="text-[#b7ff00]">Rep</span>Flow
        </p>
        <p className={`mt-1 text-center text-[10px] font-bold uppercase tracking-[0.18em] sm:mt-2 sm:text-xs ${theme.muted}`}>
          Setup · step {visualStep + 1} of {steps.length}
        </p>

        <div className="mt-3 flex justify-center gap-2 sm:mt-4">
          {steps.map((item, index) => (
            <div
              key={item.key}
              className={`h-1 w-10 rounded-full transition sm:h-1.5 sm:w-12 ${
                index <= visualStep ? "bg-[#b7ff00]" : theme.isLight ? "bg-black/10" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div
          className={`mt-4 rounded-2xl border p-4 sm:mt-5 sm:rounded-3xl sm:p-6 lg:max-h-[min(70vh,560px)] lg:overflow-y-auto ${
            theme.isLight ? "border-black/10 bg-white shadow-sm" : "border-white/12 bg-white/[0.065]"
          }`}
        >
          <AnimatePresence mode="wait">
            {showingUsername ? (
              <motion.div
                key="username"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Choose your username</h1>
                <p className={`mt-1.5 text-sm ${theme.muted}`}>This is how you show up across RepFlow.</p>
                <label className="mt-4 block sm:mt-5">
                  <span className={`text-xs font-bold uppercase tracking-[0.18em] ${theme.muted}`}>Username</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="repflow_athlete"
                    minLength={3}
                    maxLength={20}
                    className={`mt-1.5 min-h-11 w-full px-4 text-sm transition placeholder:opacity-40 sm:min-h-12 ${theme.input}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={goNextFromUsername}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#b7ff00] text-sm font-black text-black sm:mt-5 sm:min-h-11"
                >
                  Continue
                  <FiArrowRight />
                </button>
              </motion.div>
            ) : null}

            {showingGoals ? (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Set your targets</h1>
                <p className={`mt-1.5 text-sm ${theme.muted}`}>You can change these anytime on the Goals page.</p>

                <div className="mt-3 sm:mt-4">
                  <p className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${theme.muted}`}>Period</p>
                  <SegmentedControl
                    value={goals.goal_type}
                    onChange={(goal_type) => setGoals((prev) => ({ ...prev, goal_type }))}
                    layoutId="onboarding-period-pill"
                    size="sm"
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                      { value: "monthly", label: "Monthly" },
                    ]}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:gap-2.5">
                  <GoalField
                    icon={FiDroplet}
                    label="Water"
                    unit="cl"
                    value={goals.water_cl}
                    onChange={(water_cl) => setGoals((prev) => ({ ...prev, water_cl }))}
                    isLight={theme.isLight}
                  />
                  <GoalField
                    icon={MdFitnessCenter}
                    label="Push-ups"
                    unit="reps"
                    value={goals.pushups}
                    onChange={(pushups) => setGoals((prev) => ({ ...prev, pushups }))}
                    isLight={theme.isLight}
                  />
                  <GoalField
                    icon={FiActivity}
                    label="Sit-ups"
                    unit="reps"
                    value={goals.situps}
                    onChange={(situps) => setGoals((prev) => ({ ...prev, situps }))}
                    isLight={theme.isLight}
                  />
                  <GoalField
                    icon={IoFootstepsOutline}
                    label="Steps"
                    unit="steps"
                    value={goals.steps}
                    onChange={(stepsValue) => setGoals((prev) => ({ ...prev, steps: stepsValue }))}
                    isLight={theme.isLight}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#b7ff00] text-sm font-black text-black sm:mt-5 sm:min-h-11"
                >
                  Continue
                  <FiArrowRight />
                </button>
              </motion.div>
            ) : null}

            {showingDone ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#b7ff00]/15 text-xl text-[#b7ff00] sm:size-14 sm:text-2xl">
                  <FiCheck />
                </div>
                <h1 className="mt-4 text-2xl font-black tracking-tight sm:mt-5 sm:text-3xl">You&apos;re set</h1>
                <p className={`mt-1.5 text-sm ${theme.muted}`}>
                  Log your first activity, check the dashboard, and chat with your coach whenever you need a nudge.
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinish}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#b7ff00] text-sm font-black text-black disabled:opacity-55 sm:mt-5 sm:min-h-11"
                >
                  {saving ? "Saving..." : "Go to dashboard"}
                  <FiArrowRight />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {status ? <p className="mt-3 text-center text-sm text-red-400">{status}</p> : null}
        </div>
      </section>
    </main>
  );
}

function GoalField({ icon: Icon, label, unit, value, onChange, isLight }) {
  return (
    <label
      className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 sm:gap-3 sm:px-3 sm:py-2 ${
        isLight ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-black/25"
      }`}
    >
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#b7ff00]/10 text-[#b7ff00] sm:size-9">
        <Icon className="text-sm sm:text-base" />
      </div>
      <div className="min-w-0 flex-1">
        <span className={`text-[11px] font-bold sm:text-xs ${isLight ? "text-black/45" : "text-white/45"}`}>
          {label}
        </span>
        <input
          type="number"
          min={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="mt-0 w-full bg-transparent text-sm font-black outline-none"
        />
      </div>
      <span className={`text-[11px] font-bold sm:text-xs ${isLight ? "text-black/30" : "text-white/30"}`}>{unit}</span>
    </label>
  );
}
