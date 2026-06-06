"use client";

import { AnimatePresence, motion } from "framer-motion";
import CardHeader from "./CardHeader";
import NumberInput from "./NumberInput";
import ProgressBar from "./ProgressBar";

const repPresets = [5, 10, 15, 20, 25, 30, 40, 50];

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function ExerciseCard({
  title,
  icon,
  iconBg,
  iconColor,
  sets,
  total,
  goal,
  reps,
  setsCount,
  selectedPreset,
  onRepsChange,
  onSetsCountChange,
  onPreset,
  onAdd,
  onDelete,
}) {
  const calculated = (Number.parseInt(reps, 10) || 0) * (Number.parseInt(setsCount, 10) || 1);

  return (
    <motion.article variants={itemVariants} className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5 transition hover:border-white/[0.14]">
      <CardHeader icon={icon} iconBg={iconBg} iconColor={iconColor} title={title} subtitle={`Today: ${total} reps`} total={total} unit="reps" />

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/30">Sets logged</p>
        <AnimatePresence initial={false}>
          {sets.map((set, index) => (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between py-1 text-sm text-white/65">
                <span>
                  Set {index + 1} - {set.reps} reps
                </span>
                <button onClick={() => onDelete(set.id)} className="text-white/20 transition hover:text-white/60">
                  x
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sets.length === 0 ? <p className="text-sm text-white/25">No sets logged yet</p> : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/30">Reps</span>
          <NumberInput value={reps} onChange={onRepsChange} placeholder="0" className="min-h-12 text-sm" />
        </label>
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/30">Sets</span>
          <NumberInput value={setsCount} onChange={onSetsCountChange} placeholder="1" className="min-h-12 text-sm" />
        </label>
      </div>

      {calculated > 0 ? <p className="mt-3 text-sm font-black text-[#b7ff00]">= {calculated} reps total</p> : null}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {repPresets.map((preset) => (
          <motion.button
            key={preset}
            whileTap={{ scale: 0.92 }}
            onClick={() => onPreset(preset)}
            className={`min-h-9 shrink-0 rounded-lg border px-4 text-sm font-bold transition ${
              selectedPreset === preset
                ? "border-[#b7ff00] bg-[#b7ff00] text-black shadow-[0_0_10px_#b7ff0060]"
                : "border-white/[0.08] bg-white/[0.03] text-white/70"
            }`}
          >
            {preset}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="mt-4 min-h-12 w-full rounded-xl border border-[#b7ff00]/30 bg-[#b7ff00]/10 text-sm font-black text-[#b7ff00]"
      >
        + Add Set
      </motion.button>

      <ProgressBar total={total} goal={goal} unit="reps" />
    </motion.article>
  );
}
