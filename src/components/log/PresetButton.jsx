"use client";

import { motion } from "framer-motion";

export default function PresetButton({ selected, onClick, children }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`min-h-11 rounded-xl border text-[13px] font-bold transition ${
        selected
          ? "border-[#b7ff00] bg-[#b7ff00] text-black shadow-[0_0_10px_#b7ff0060]"
          : "border-white/[0.08] bg-white/[0.03] text-white/70"
      }`}
    >
      {children}
    </motion.button>
  );
}
