"use client";
import { CartesianGrid, ComposedChart, Area, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { SCURVE, EVM } from "@/data/core";
import { ChartTip, axis } from "@/components/ui/charts";
import { Tip, cn } from "@/components/ui/ui";

export function SCurve({ height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={SCURVE} margin={{ left: -14, right: 0, top: 14 }}>
        <defs><linearGradient id="ev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--info)" stopOpacity={0.22} /><stop offset="1" stopColor="var(--info)" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="m" {...axis} /><YAxis yAxisId="l" {...axis} unit="%" domain={[0, 100]} /><YAxis yAxisId="r" orientation="right" {...axis} hide />
        <Tooltip content={<ChartTip fmt={(v) => v} />} />
        <ReferenceLine yAxisId="l" x="Oct" stroke="var(--ink)" strokeDasharray="3 3" label={{ value: "Today · 62% vs 65% plan", position: "insideTopLeft", fontSize: 10.5, fill: "var(--bad)", dx: 6 }} />
        <Area isAnimationActive={false} yAxisId="r" dataKey="Earned" name="Earned value (₹Cr)" stroke="none" fill="url(#ev)" />
        <Line isAnimationActive={false} yAxisId="l" dataKey="Planned" name="Planned %" stroke="var(--faint)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        <Line isAnimationActive={false} yAxisId="l" dataKey="Actual" name="Actual %" stroke="var(--accent)" strokeWidth={2.6} dot={false} />
        <Line isAnimationActive={false} yAxisId="l" dataKey="Forecast" name="Forecast %" stroke="var(--accent)" strokeWidth={2} strokeDasharray="2 4" dot={false} />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 11.5, paddingTop: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function EvmPanel() {
  const rows = [
    { k: "Planned Value", v: `₹${EVM.PV} Cr`, tip: "Value of work that should have been done by today as per the plan.", say: "Work you planned to have finished by today" },
    { k: "Earned Value", v: `₹${EVM.EV} Cr`, tip: "Budgeted value of the work actually completed so far.", say: "Work actually completed, at budgeted cost" },
    { k: "Actual Cost", v: `₹${EVM.AC} Cr`, tip: "Money spent or accrued to date (includes work received but not yet invoiced).", say: "What it actually cost (incl. ₹0.57 Cr accrued)" },
    { k: "SPI", v: EVM.SPI.toFixed(2), tone: "warn", tip: "Schedule Performance Index = Earned ÷ Planned. Below 1.0 means behind schedule.", say: "Progressing ~5% slower than planned" },
    { k: "CPI", v: EVM.CPI.toFixed(2), tone: "warn", tip: "Cost Performance Index = Earned ÷ Actual. Below 1.0 means over budget.", say: "Every ₹1 spent delivers ₹0.96 of work" },
    { k: "Estimated at Completion", v: `₹${EVM.EAC} Cr`, tone: "risk", tip: "Forecast total cost = Budget ÷ CPI.", say: "Likely final cost vs ₹15.8 Cr budget (+₹60L)" },
  ];
  return (
    <div className="divide-y divide-line">
      {rows.map((r) => (
        <div key={r.k} className="flex items-center justify-between gap-3 py-2">
          <div><div className="flex items-center gap-1 text-[12.5px] font-medium">{r.k}<Tip text={r.tip} /></div><div className="text-[11.5px] text-mute">{r.say}</div></div>
          <div className={cn("num text-[16px] font-semibold", r.tone === "warn" && "text-warn", r.tone === "risk" && "text-risk")}>{r.v}</div>
        </div>
      ))}
    </div>
  );
}
