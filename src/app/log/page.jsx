"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiActivity, FiDroplet } from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";
import AppNav from "@/components/AppNav";
import CardHeader from "@/components/log/CardHeader";
import ExerciseCard from "@/components/log/ExerciseCard";
import NumberInput from "@/components/log/NumberInput";
import PresetButton from "@/components/log/PresetButton";
import ProgressBar from "@/components/log/ProgressBar";
import SummaryPill from "@/components/log/SummaryPill";
import WaterHistory from "@/components/log/WaterHistory";
import { fetchTodayLogs } from "@/app/actions/fetchLogs";
import { getGoals } from "@/app/actions/goals";
import { saveAllLogs } from "@/app/actions/log";
import { useThemeClasses } from "@/lib/theme";

const DEFAULT_GOALS = { water_cl: 250, pushups: 50, situps: 50, steps: 10000 };

function getLocalTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start: start.toISOString(), end: end.toISOString() };
}

const waterPresets = [10, 15, 20, 25, 30, 35, 40, 50, 75, 100, 150];
const stepPresets = [500, 1000, 2000, 5000];

const cardVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function LogPage() {
  const theme = useThemeClasses();
  const [waterEntries, setWaterEntries] = useState([]);
  const [selectedWaterPreset, setSelectedWaterPreset] = useState(null);
  const [customWaterAmount, setCustomWaterAmount] = useState("");
  const [showCustomWater, setShowCustomWater] = useState(false);
  const [showAllWater, setShowAllWater] = useState(false);

  const [pushupSets, setPushupSets] = useState([]);
  const [pushupReps, setPushupReps] = useState("");
  const [pushupSetsCount, setPushupSetsCount] = useState("1");
  const [selectedPushupPreset, setSelectedPushupPreset] = useState(null);

  const [situpSets, setSitupSets] = useState([]);
  const [situpReps, setSitupReps] = useState("");
  const [situpSetsCount, setSitupSetsCount] = useState("1");
  const [selectedSitupPreset, setSelectedSitupPreset] = useState(null);

  const [steps, setSteps] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [savedTotals, setSavedTotals] = useState({ water: 0, pushups: 0, situps: 0, steps: 0 });

  const sessionWater = useMemo(() => waterEntries.reduce((sum, entry) => sum + entry.amount, 0), [waterEntries]);
  const sessionPushups = useMemo(() => pushupSets.reduce((sum, set) => sum + set.reps, 0), [pushupSets]);
  const sessionSitups = useMemo(() => situpSets.reduce((sum, set) => sum + set.reps, 0), [situpSets]);

  const stepsInput = steps === "" ? null : Number.parseInt(steps, 10);
  const stepsTotal = stepsInput == null || Number.isNaN(stepsInput) ? savedTotals.steps : stepsInput;
  const stepsToSave = stepsInput == null || Number.isNaN(stepsInput) ? 0 : Math.max(0, stepsInput - savedTotals.steps);

  const waterTotal = savedTotals.water + sessionWater;
  const pushupsTotal = savedTotals.pushups + sessionPushups;
  const situpsTotal = savedTotals.situps + sessionSitups;

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadGoalsAndTotals() {
      try {
        const [goalsResult, logsResult] = await Promise.allSettled([
          getGoals(),
          fetchTodayLogs(getLocalTodayRange()),
        ]);

        if (!isMounted) return;

        if (goalsResult.status === "fulfilled" && !goalsResult.value.error && goalsResult.value.data) {
          setGoals(goalsResult.value.data);
        }

        if (logsResult.status === "fulfilled" && !logsResult.value.error && logsResult.value.totals) {
          setSavedTotals(logsResult.value.totals);
        }
      } catch {
        // Keep defaults on failure
      }
    }

    loadGoalsAndTotals();
    window.addEventListener("focus", loadGoalsAndTotals);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", loadGoalsAndTotals);
    };
  }, []);

  function addWater(amount) {
    const value = amount ?? selectedWaterPreset;

    if (!value || value <= 0) {
      return;
    }

    setWaterEntries((entries) => [
      {
        id: crypto.randomUUID(),
        amount: value,
        time: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
      },
      ...entries,
    ]);
    setCustomWaterAmount("");
    setShowCustomWater(false);
  }

  function addCustomWater() {
    addWater(Number.parseInt(customWaterAmount, 10));
  }

  function addExerciseSet(kind) {
    const reps = Number.parseInt(kind === "pushups" ? pushupReps : situpReps, 10) || 0;
    const sets = Number.parseInt(kind === "pushups" ? pushupSetsCount : situpSetsCount, 10) || 1;
    const total = reps * sets;

    if (total <= 0) {
      return;
    }

    const entry = { id: crypto.randomUUID(), reps: total };

    if (kind === "pushups") {
      setPushupSets((items) => [...items, entry]);
      setPushupReps("");
      setPushupSetsCount("1");
      setSelectedPushupPreset(null);
      return;
    }

    setSitupSets((items) => [...items, entry]);
    setSitupReps("");
    setSitupSetsCount("1");
    setSelectedSitupPreset(null);
  }


  // function to save logs to supabase

  const saveLogs = async () => {
    if (!waterEntries.length && !pushupSets.length && !situpSets.length && stepsToSave === 0) {
      alert("input first");
      return;
    }

    setSaving(true);

    const result = await saveAllLogs({
      waterEntries,
      pushupSets,
      situpSets,
      steps: stepsToSave,
    });

    setSaving(false);

    if (result.error) {
      console.error(result.error);
      return;
    }

    setSavedTotals({
      water: waterTotal,
      pushups: pushupsTotal,
      situps: situpsTotal,
      steps: stepsTotal,
    });
    setShowToast(true);
    setWaterEntries([]);
    setPushupSets([]);
    setSitupSets([]);
    setSteps("");
  };

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timer = window.setTimeout(() => setShowToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  return (
    <main className={theme.pageAlt}>
      <AppNav sticky activePath="/log" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 lg:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tighter lg:text-6xl">Log activity</h1>
            <p className={`mt-2 text-sm font-bold ${theme.muted}`}>
              {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <SummaryPill icon={<FiDroplet />} value={waterTotal} unit="cl" />
            <SummaryPill icon={<MdFitnessCenter />} value={pushupsTotal} unit="reps" />
            <SummaryPill icon={<FiActivity />} value={situpsTotal} unit="reps" />
            <SummaryPill icon={<IoFootstepsOutline />} value={stepsTotal} unit="steps" />
          </div>
        </div>
      </section>

      <motion.section
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-4 px-4 pb-40 lg:grid-cols-2 lg:px-6 xl:gap-5"
      >
        <motion.article variants={itemVariants} className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5 transition hover:border-white/[0.14]">
          <CardHeader
            icon={<FiDroplet />}
            iconBg="#0a1a2a"
            iconColor="#60a5fa"
            title="Water"
            subtitle={`Today: ${waterTotal}cl`}
            total={waterTotal}
            unit="cl"
          />

          <div className="mt-6 grid grid-cols-4 gap-2">
            {waterPresets.map((amount) => (
              <PresetButton
                key={amount}
                selected={selectedWaterPreset === amount && !showCustomWater}
                onClick={() => {
                  setSelectedWaterPreset(amount);
                  setShowCustomWater(false);
                }}
              >
                {amount}cl
              </PresetButton>
            ))}
            <PresetButton
              selected={showCustomWater}
              onClick={() => {
                setShowCustomWater(true);
                setSelectedWaterPreset(null);
              }}
            >
              Custom
            </PresetButton>
          </div>

          <AnimatePresence>
            {showCustomWater ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex gap-2">
                  <NumberInput value={customWaterAmount} onChange={setCustomWaterAmount} placeholder="Enter cl" className="min-h-11 flex-1 text-sm" />
                  <motion.button whileTap={{ scale: 0.97 }} onClick={addCustomWater} className="min-h-11 rounded-xl bg-[#b7ff00] px-5 text-sm font-black text-black">
                    + Add
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!selectedWaterPreset}
            onClick={() => addWater()}
            className="mt-4 min-h-12 w-full rounded-xl border border-[#b7ff00]/30 bg-[#b7ff00]/10 text-sm font-black text-[#b7ff00] transition disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/25"
          >
            + Log Water
          </motion.button>

          <WaterHistory
            entries={waterEntries}
            showAll={showAllWater}
            onToggleAll={() => setShowAllWater((value) => !value)}
            onDelete={(id) => setWaterEntries((entries) => entries.filter((entry) => entry.id !== id))}
          />

          <ProgressBar total={waterTotal} goal={goals.water_cl} unit="cl" />
        </motion.article>

        <ExerciseCard
          title="Push-ups"
          icon={<MdFitnessCenter />}
          iconBg="#1a0a00"
          iconColor="#f97316"
          sets={pushupSets}
          total={pushupsTotal}
          goal={goals.pushups}
          reps={pushupReps}
          setsCount={pushupSetsCount}
          selectedPreset={selectedPushupPreset}
          onRepsChange={setPushupReps}
          onSetsCountChange={setPushupSetsCount}
          onPreset={(value) => {
            setPushupReps(String(value));
            setSelectedPushupPreset(value);
          }}
          onAdd={() => addExerciseSet("pushups")}
          onDelete={(id) => setPushupSets((sets) => sets.filter((set) => set.id !== id))}
        />

        <ExerciseCard
          title="Sit-ups"
          icon={<FiActivity />}
          iconBg="#0a1a0a"
          iconColor="#4ade80"
          sets={situpSets}
          total={situpsTotal}
          goal={goals.situps}
          reps={situpReps}
          setsCount={situpSetsCount}
          selectedPreset={selectedSitupPreset}
          onRepsChange={setSitupReps}
          onSetsCountChange={setSitupSetsCount}
          onPreset={(value) => {
            setSitupReps(String(value));
            setSelectedSitupPreset(value);
          }}
          onAdd={() => addExerciseSet("situps")}
          onDelete={(id) => setSitupSets((sets) => sets.filter((set) => set.id !== id))}
        />

        <motion.article variants={itemVariants} className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5 transition hover:border-white/[0.14]">
          <CardHeader
            icon={<IoFootstepsOutline />}
            iconBg="#1a1a00"
            iconColor="#b7ff00"
            title="Steps"
            subtitle={`Today: ${stepsTotal} steps`}
            total={stepsTotal}
            unit="steps"
          />
          <NumberInput value={steps} onChange={setSteps} placeholder="0" className="mt-6 h-[72px] text-center text-3xl font-black" />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stepPresets.map((amount) => (
              <motion.button
                key={amount}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSteps(String(stepsTotal + amount))}
                className="min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-bold text-white/70 transition hover:border-white/20"
              >
                +{amount.toLocaleString()}
              </motion.button>
            ))}
          </div>
          <ProgressBar total={stepsTotal} goal={goals.steps} unit="steps" />
        </motion.article>
      </motion.section>

      <AnimatePresence>
        {showToast ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[116px] left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-[#b7ff00]/40 bg-[#0f0f0f] px-5 py-3 text-center text-sm font-black text-[#b7ff00]"
          >
            Saved
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#050505]/[0.92] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            <SummaryPill icon={<FiDroplet />} value={waterTotal} unit="cl" />
            <SummaryPill icon={<MdFitnessCenter />} value={pushupsTotal} unit="reps" />
            <SummaryPill icon={<FiActivity />} value={situpsTotal} unit="reps" />
            <SummaryPill icon={<IoFootstepsOutline />} value={stepsTotal} unit="steps" />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={saveLogs}
            disabled={saving}
            className="min-h-[52px] w-full rounded-2xl bg-[#b7ff00] text-base font-black text-black transition hover:scale-102 disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                />
                Saving...
              </span>
            ) : (
              "Save all logs"
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
