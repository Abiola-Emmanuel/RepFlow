export default function CardHeader({ icon, iconBg, iconColor, title, subtitle, total, unit }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <div>
          <h2 className="text-base font-black">{title}</h2>
          <p className="text-xs text-white/40">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-[#b7ff00]">{unit === "steps" ? total.toLocaleString() : total}</p>
        <p className="text-xs text-white/30">{unit}</p>
      </div>
    </div>
  );
}
