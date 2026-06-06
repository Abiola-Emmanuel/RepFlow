"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

export default function WaterHistory({ entries, showAll, onToggleAll, onDelete }) {
  const visibleEntries = showAll ? entries : entries.slice(0, 5);

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Today&apos;s logs</p>
        {entries.length > 5 ? (
          <button onClick={onToggleAll} className="inline-flex items-center gap-1 text-xs font-bold text-[#b7ff00]">
            {showAll ? "Show less" : "Show all"}
            <FiChevronDown className={showAll ? "rotate-180 transition" : "transition"} />
          </button>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {visibleEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between py-1 text-sm text-white/40">
              <span>{entry.time}</span>
              <span className="inline-flex items-center gap-3">
                +{entry.amount}cl
                <button onClick={() => onDelete(entry.id)} className="text-white/20 transition hover:text-white/60">
                  x
                </button>
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {entries.length === 0 ? <p className="text-sm text-white/25">No water logged yet</p> : null}
    </div>
  );
}
