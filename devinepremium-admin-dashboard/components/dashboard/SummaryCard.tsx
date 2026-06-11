export function SummaryCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`rounded-[28px] p-6 text-white shadow-xl ${accent}`}>
      {icon && <div className="mb-3 opacity-80">{icon}</div>}
      <p className="text-sm uppercase tracking-[0.22em] text-white/70">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}
