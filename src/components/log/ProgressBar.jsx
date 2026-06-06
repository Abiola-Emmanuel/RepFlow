"use client";

import { motion } from "framer-motion";

export default function ProgressBar({ total, goal, unit }) {
  const percentage = Math.min(Math.round((total / goal) * 100), 100);

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between text-xs text-white/30">
        <span>
          {unit === "steps" ? total.toLocaleString() : total} / {unit === "steps" ? goal.toLocaleString() : goal} {unit}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-[#b7ff00]"
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
