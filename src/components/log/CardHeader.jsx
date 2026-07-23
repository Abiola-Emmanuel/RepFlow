"use client";

import { useThemeClasses } from "@/lib/theme";

export default function CardHeader({ icon, iconBg, iconColor, title, subtitle, total, unit }) {
  const theme = useThemeClasses();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-base font-black">{title}</h2>
          <p className={`text-xs ${theme.muted}`}>{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-[#b7ff00]">
          {typeof total === "number" && (unit === "steps" || unit === "reps")
            ? total.toLocaleString()
            : total}
        </p>
        <p className={`text-xs ${theme.faint}`}>{unit}</p>
      </div>
    </div>
  );
}
