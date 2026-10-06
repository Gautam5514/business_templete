"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie } from "recharts";
import { useMounted, cn } from "./ui";
import { lakh, lakhShort } from "@/lib/format";

const C = { accent: "#3a3fc4", ok: "#157347", bad: "#b42318", warn: "#a15c07", grid: "#ecebe7", mute: "#6b6a64", ink: "#1b1b19" };

export function Spark({ data, tone = "accent", height = 28 }: { data: { v: number }[]; tone?: "accent" | "ok" | "bad" | "warn"; height?: number }) {
  const m = useMounted();
  const col = C[tone];
  if (!m) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs><linearGradient id={`g-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity={0.18} /><stop offset="100%" stopColor={col} stopOpacity={0} /></linearGradient></defs>
        <YAxis hide domain={["dataMin - 4", "dataMax + 2"]} />
        <Area type="monotone" dataKey="v" stroke={col} strokeWidth={1.4} fill={`url(#g-${tone})`} isAnimationActive={false} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const tip = { contentStyle: { border: "1px solid #e7e6e2", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: "8px 10px" }, labelStyle: { fontWeight: 600, marginBottom: 4 }, cursor: { stroke: "#d6d4ce" } };

export function TrendChart({ data, height = 300 }: { data: { label: string; sales: number; collections: number; outstanding: number }[]; height?: number }) {
  const m = useMounted();
  if (!m) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs><linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.16} /><stop offset="100%" stopColor={C.accent} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.mute }} tickLine={false} axisLine={{ stroke: C.grid }} interval="preserveStartEnd" minTickGap={14} />
        <YAxis tick={{ fontSize: 11, fill: C.mute }} tickLine={false} axisLine={false} tickFormatter={(v) => lakhShort(v)} width={64} />
        <Tooltip {...tip} formatter={(v, n) => [lakh(Number(v)), String(n)]} />
        <Area type="monotone" dataKey="sales" name="Sales" stroke={C.accent} strokeWidth={2} fill="url(#gs)" dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="collections" name="Collections" stroke={C.ok} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="outstanding" name="Outstanding" stroke={C.bad} strokeWidth={1.75} strokeDasharray="4 3" dot={false} activeDot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({ data, keys, height = 240, colors, money = true, stacked }: { data: Record<string, string | number>[]; keys: { k: string; name: string }[]; height?: number; colors?: string[]; money?: boolean; stacked?: boolean }) {
  const m = useMounted();
  if (!m) return <div style={{ height }} />;
  const cols = colors ?? [C.accent, "#9aa0e6", C.ok];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.mute }} tickLine={false} axisLine={{ stroke: C.grid }} />
        <YAxis tick={{ fontSize: 11, fill: C.mute }} tickLine={false} axisLine={false} tickFormatter={(v) => (money ? lakhShort(v) : String(v))} width={64} />
        <Tooltip {...tip} cursor={{ fill: "#f4f4f2" }} formatter={(v, n) => [money ? lakh(Number(v)) : Number(v).toLocaleString("en-IN"), String(n)]} />
        {keys.map((k, i) => <Bar key={k.k} dataKey={k.k} name={k.name} stackId={stacked ? "a" : undefined} fill={cols[i % cols.length]} radius={stacked ? 0 : [3, 3, 0, 0]} maxBarSize={28} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 180 }: { data: { name: string; value: number; color: string }[]; height?: number }) {
  const m = useMounted();
  if (!m) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={1.5} stroke="none" isAnimationActive={false}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip {...tip} formatter={(v) => lakh(Number(v))} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HBar({ label, value, max, sub, tone = "accent" }: { label: string; value: string; max: number; sub?: string; tone?: "accent" | "ok" | "bad" | "warn" }) {
  const n = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12.5px]"><span className="truncate pr-2">{label}</span><span className="num font-medium">{value}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-panel"><div className={cn("h-full rounded-full", tone === "ok" ? "bg-ok" : tone === "bad" ? "bg-bad" : tone === "warn" ? "bg-warn" : "bg-accent")} style={{ width: `${Math.min(100, (n / max) * 100)}%` }} /></div>
      {sub && <div className="mt-0.5 text-[11.5px] text-faint">{sub}</div>}
    </div>
  );
}
export const CHART_COLORS = C;
