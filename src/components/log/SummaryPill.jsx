"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useThemeClasses } from "@/lib/theme";

export default function SummaryPill({ icon, value, unit }) {
  const theme = useThemeClasses();
  const scaleValue = useMotionValue(1);
  const scale = useSpring(scaleValue, { stiffness: 420, damping: 18 });
  const active = Number(value) > 0;

  useEffect(() => {
    scaleValue.set(1.12);
    const timer = window.setTimeout(() => scaleValue.set(1), 120);
    return () => window.clearTimeout(timer);
  }, [value, scaleValue]);

  const formatted =
    unit === "steps" || unit === "reps"
      ? Number(value).toLocaleString()
      : typeof value === "number"
        ? unit === "oz"
          ? value.toFixed(1)
          : value.toLocaleString()
        : value;

  return (
    <motion.span
      style={{ scale }}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${
        active
          ? "border-[#b7ff00] text-[#b7ff00]"
          : `${theme.borderSubtle} ${theme.mutedStrong} ${theme.isLight ? "bg-black/[0.03]" : "bg-white/[0.03]"}`
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span>
        {formatted}
        {unit ? ` ${unit}` : ""}
      </span>
    </motion.span>
  );
}
