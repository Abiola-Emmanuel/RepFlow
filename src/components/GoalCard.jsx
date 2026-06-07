"use client"
import { motion } from 'framer-motion'
import { useState } from 'react';


const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 18 } },
};

export function GoalCard({ field, value, onChange }) {
  const Icon = field.icon;
  const [focused, setFocused] = useState(false);

  const percent = Math.min((value / field.presets[field.presets.length - 1]) * 100, 100);

  return (
    <motion.article
      variants={cardVariants}
      className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-5 transition-colors hover:border-white/[0.14] lg:p-6"
    >
      {/* header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: field.iconBg }}
          >
            <Icon style={{ color: field.iconColor }} className="text-lg" />
          </div>
          <div>
            <h3 className="font-black">{field.label}</h3>
            <p className="text-xs text-white/35">{field.description}</p>
          </div>
        </div>
        {/* current value badge */}
        <div className="flex-shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-center">
          <span className="block text-lg font-black" style={{ color: "#b7ff00" }}>
            {value?.toLocaleString() ?? "—"}
          </span>
          <span className="text-[10px] text-white/30">{field.unit}</span>
        </div>
      </div>

      {/* preset buttons */}
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {field.presets.map((preset) => (
          <motion.button
            key={preset}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(preset)}
            className="min-h-[40px] rounded-xl border text-xs font-bold transition-all duration-200"
            style={
              value === preset
                ? {
                  backgroundColor: "#b7ff00",
                  borderColor: "#b7ff00",
                  color: "#000",
                  boxShadow: "0 0 10px #b7ff0050",
                }
                : {
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                }
            }
          >
            {preset.toLocaleString()}
          </motion.button>
        ))}
      </div>

      {/* custom number input */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/30">
          Custom value
        </label>
        <div className="flex gap-2">
          {/* minus */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.max(field.min, (value ?? 0) - field.step))}
            aria-label={`Decrease ${field.label}`}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg font-black text-white/60 transition hover:border-white/20 hover:text-white"
          >
            −
          </motion.button>

          {/* input */}
          <input
            type="number"
            inputMode="numeric"
            value={value ?? ""}
            min={field.min}
            max={field.max}
            step={field.step}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!isNaN(parsed)) onChange(Math.min(field.max, Math.max(field.min, parsed)));
            }}
            className="h-11 min-w-0 flex-1 rounded-xl border bg-[#0a0a0a] text-center text-base font-black text-white outline-none transition-all"
            style={{
              borderColor: focused ? "#b7ff00" : "rgba(255,255,255,0.1)",
              boxShadow: focused ? "0 0 0 2px #b7ff0020" : "none",
            }}
          />

          {/* plus */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.min(field.max, (value ?? 0) + field.step))}
            aria-label={`Increase ${field.label}`}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg font-black text-white/60 transition hover:border-white/20 hover:text-white"
          >
            +
          </motion.button>

          {/* unit label */}
          <div className="flex h-11 items-center rounded-xl border border-white/8 bg-white/[0.02] px-3 text-xs font-bold text-white/30">
            {field.unit}
          </div>
        </div>
      </div>

      {/* progress preview bar */}
      <div>
        <div className="mb-1 flex justify-between text-[10px] text-white/25">
          <span>{field.min.toLocaleString()} {field.unit}</span>
          <span>Max shown: {field.presets[field.presets.length - 1].toLocaleString()}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "#b7ff00" }}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* tip */}
      <p className="mt-3 text-[11px] text-white/25">💡 {field.tip}</p>
    </motion.article>
  );
}
