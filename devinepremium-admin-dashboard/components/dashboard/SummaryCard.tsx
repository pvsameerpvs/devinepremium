export function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className={`rounded-[28px] p-6 text-white shadow-xl ${accent}`}>
      <p className="text-sm uppercase tracking-[0.22em] text-white/70">{label}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}
