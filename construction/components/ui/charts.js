"use client";
export function ChartTip({ active, payload, label, fmt = (v) => v, suffix }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-line-strong bg-surface px-2.5 py-2 text-[12px] shadow-lg">
      {label != null && <div className="mb-1 font-semibold">{label}</div>}
      {payload.filter((p) => p.value != null).map((p) => (
        <div key={p.dataKey + p.name} className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5 text-mute"><span className="h-2 w-2 rounded-sm" style={{ background: p.color || p.fill || p.stroke }} />{p.name ?? p.dataKey}</span><span className="num font-semibold">{fmt(p.value)}{suffix}</span></div>
      ))}
    </div>
  );
}
export const axis = { tick: { fontSize: 11, fill: "var(--mute)" }, axisLine: false, tickLine: false };
