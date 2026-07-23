"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useThemeClasses } from "@/lib/theme";
import { formatWaterAmount, waterUnitLabel } from "@/lib/preferences";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 18 } },
};

export function GoalCard({ field, value, onChange }) {
  const Icon = field.icon;
  const [focused, setFocused] = useState(false);
  const theme = useThemeClasses();
  const isWater = field.key === "water_cl";
  const displayUnit = isWater ? waterUnitLabel(theme.waterUnit) : field.unit;
  const displayValue = isWater ? formatWaterAmount(value, theme.waterUnit) : (value?.toLocaleString() ?? "—");

  const percent = Math.min((value / field.presets[field.presets.length - 1]) * 100, 100);

  return (
    <motion.article
      variants={cardVariants}
      className={`${theme.cardSoft} p-5 transition-colors ${theme.cardHover} lg:p-6`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: field.iconBg }}
          >
            <Icon style={{ color: field.iconColor }} className="text-lg" />
          </div>
          <div>
            <h3 className="font-black">{field.label.replace(/\(cl\)|cl$/, "").replace(/\bcl\b/i, displayUnit)}</h3>
            <p className={`text-xs ${theme.muted}`}>{field.description}</p>
          </div>
        </div>
        <div className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-center ${theme.insetStrong}`}>
          <span className="block text-lg font-black text-[#b7ff00]">{displayValue}</span>
          <span className={`text-[10px] ${theme.faint}`}>{displayUnit}</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {field.presets.map((preset) => {
          const selected = value === preset;
          const label = isWater ? formatWaterAmount(preset, theme.waterUnit) : preset.toLocaleString();

          return (
            <motion.button
              key={preset}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(preset)}
              className={`min-h-[40px] rounded-xl border text-xs font-bold transition-all duration-200 ${
                selected
                  ? "border-[#b7ff00] bg-[#b7ff00] text-black shadow-[0_0_10px_#b7ff0050]"
                  : theme.chipIdle
              }`}
            >
              {label}
            </motion.button>
          );
        })}
      </div>

      <div className="mb-4">
        <label className={`mb-1.5 block text-xs font-bold uppercase tracking-widest ${theme.faint}`}>
          Custom value {isWater ? `(stored as cl · showing ${displayUnit})` : ""}
        </label>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.max(field.min, (value ?? 0) - field.step))}
            aria-label={`Decrease ${field.label}`}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg font-black transition ${theme.inset} ${theme.mutedStrong}`}
          >
            −
          </motion.button>

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
            className={`h-11 min-w-0 flex-1 text-center text-base font-black outline-none transition-all ${theme.inputBox}`}
            style={{
              borderColor: focused ? "#b7ff00" : undefined,
              boxShadow: focused ? "0 0 0 2px #b7ff0020" : "none",
            }}
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.min(field.max, (value ?? 0) + field.step))}
            aria-label={`Increase ${field.label}`}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg font-black transition ${theme.inset} ${theme.mutedStrong}`}
          >
            +
          </motion.button>

          <div className={`flex h-11 items-center rounded-xl px-3 text-xs font-bold ${theme.inset} ${theme.faint}`}>
            {isWater ? "cl" : displayUnit}
          </div>
        </div>
      </div>

      <div>
        <div className={`mb-1 flex justify-between text-[10px] ${theme.faint}`}>
          <span>
            {isWater ? formatWaterAmount(field.min, theme.waterUnit) : field.min.toLocaleString()} {displayUnit}
          </span>
          <span>
            Max shown:{" "}
            {isWater
              ? formatWaterAmount(field.presets[field.presets.length - 1], theme.waterUnit)
              : field.presets[field.presets.length - 1].toLocaleString()}
          </span>
        </div>
        <div className={`h-1.5 w-full overflow-hidden rounded-full ${theme.track}`}>
          <motion.div
            className="h-full rounded-full bg-[#b7ff00]"
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <p className={`mt-3 text-[11px] ${theme.faint}`}>{field.tip}</p>
    </motion.article>
  );
}
