"use client";

import { motion } from "framer-motion";

/**
 * Animated segmented control with a sliding active background.
 */
export default function SegmentedControl({
  value,
  options,
  onChange,
  layoutId = "segmented-pill",
  className = "",
  size = "md",
}) {
  const isSm = size === "sm";

  return (
    <div
      className={`relative grid rounded-xl p-1 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        backgroundColor: "color-mix(in srgb, currentColor 8%, transparent)",
      }}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`relative z-10 rounded-lg text-sm font-bold transition-colors ${
              isSm ? "min-h-9 px-3" : "min-h-10 px-4"
            } ${isActive ? "text-black" : "opacity-45 hover:opacity-80"}`}
          >
            {isActive ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-[#b7ff00]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
