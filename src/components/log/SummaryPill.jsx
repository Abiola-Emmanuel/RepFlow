"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function SummaryPill({ icon, value, unit }) {
  const scaleValue = useMotionValue(1);
  const scale = useSpring(scaleValue, { stiffness: 420, damping: 18 });
  const active = value > 0;

  useEffect(() => {
    scaleValue.set(1.12);
    const timer = window.setTimeout(() => scaleValue.set(1), 120);
    return () => window.clearTimeout(timer);
  }, [value, scaleValue]);

  return (
    <motion.span
      style={{ scale }}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border bg-white/[0.03] px-3 text-xs font-bold transition ${
        active ? "border-[#b7ff00] text-[#b7ff00]" : "border-white/10 text-white/55"
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span>
        {unit === "steps" ? value.toLocaleString() : value}
        {unit === "cl" ? "cl" : ` ${unit}`}
      </span>
    </motion.span>
  );
}
