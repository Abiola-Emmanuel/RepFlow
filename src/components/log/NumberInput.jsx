export default function NumberInput({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#b7ff00] focus:shadow-[0_0_0_2px_#b7ff0020] ${className}`}
    />
  );
}
