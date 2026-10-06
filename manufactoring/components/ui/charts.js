"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie, Legend } from "recharts";
import { useMounted, cn } from "./ui";

export const C = { accent: "#24384a", soft: "#8fa3b5", ok: "#157347", bad: "#b42318", warn: "#a15c07", info: "#1d5fa8", grid: "#ecebe7", mute: "#666962" };
const tip = { contentStyle: { border: "1px solid #e5e4e0", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: "8px 10px" }, labelStyle: { fontWeight: 600, marginBottom: 4 }, cursor: { fill: "#f1f1ee" } };
const ax = { tick: { fontSize: 11, fill: C.mute }, tickLine: false };
const fmtN = (v) => Number(v).toLocaleString("en-IN");

export function Spark({ data, tone = "accent", height = 28 }) {
  const m = useMounted();
  const col = C[tone];
  if (!m) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data.map((v) => ({ v }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
        <Area type="monotone" dataKey="v" stroke={col} strokeWidth={1.4} fill={col} fillOpacity={0.1} isAnimationActive={false} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Bars (optionally with a target line series). keys: [{k,name,type?}] */
export function BarsChart({ data, keys, height = 240, colors, fmt = fmtN, stacked, xKey = "label", target, hBar }) {
  const m = useMounted();
  if (!m) return <div style={{ height }} />;
  const cols = colors ?? [C.accent, C.soft, C.ok, C.warn, C.bad];
  const bars = keys.filter((k) => k.type !== "line");
  const lines = keys.filter((k) => k.type === "line");
  const Chart = lines.length ? ComposedChart : BarChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} layout={hBar ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, left: hBar ? 20 : -8, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke={C.grid} vertical={!!hBar} horizontal={!hBar} />
        {hBar ? <XAxis type="number" {...ax} axisLine={false} tickFormatter={fmt} /> : <XAxis dataKey={xKey} {...ax} axisLine={{ stroke: C.grid }} />}
        {hBar ? <YAxis type="category" dataKey={xKey} {...ax} axisLine={false} width={110} /> : <YAxis {...ax} axisLine={false} tickFormatter={fmt} width={52} />}
        <Tooltip {...tip} formatter={(v, n) => [fmt(v), String(n)]} />
        {keys.length > 1 && <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11.5, paddingTop: 6 }} />}
        {target !== undefined && <ReferenceLine y={target} stroke={C.bad} strokeDasharray="4 3" label={{ value: "Target", fontSize: 10.5, fill: C.bad, position: "insideTopRight" }} />}
        {bars.map((k, i) => <Bar isAnimationActive={false} key={k.k} dataKey={k.k} name={k.name} stackId={stacked ? "a" : undefined} fill={cols[i % cols.length]} radius={stacked ? 0 : hBar ? [0, 3, 3, 0] : [3, 3, 0, 0]} maxBarSize={26} />)}
        {lines.map((k, i) => <Line isAnimationActive={false} key={k.k} type="monotone" dataKey={k.k} name={k.name} stroke={k.color ?? C.bad} strokeWidth={2} strokeDasharray={k.dash} dot={false} />)}
      </Chart>
    </ResponsiveContainer>
  );
}

export function LineChartX({ data, keys, height = 220, fmt = fmtN, xKey = "label", target, domain }) {
  const m = useMounted();
  if (!m) return <div style={{ height }} />;
  const cols = [C.accent, C.warn, C.ok, C.info, C.bad];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey={xKey} {...ax} axisLine={{ stroke: C.grid }} interval="preserveStartEnd" minTickGap={14} />
        <YAxis {...ax} axisLine={false} tickFormatter={fmt} width={48} domain={domain} />
        <Tooltip {...tip} cursor={{ stroke: "#d2d0ca" }} formatter={(v, n) => [fmt(v), String(n)]} />
        {keys.length > 1 && <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11.5, paddingTop: 6 }} />}
        {target !== undefined && <ReferenceLine y={target} stroke={C.bad} strokeDasharray="4 3" />}
        {keys.map((k, i) => <Area isAnimationActive={false} key={k.k} type="monotone" dataKey={k.k} name={k.name} stroke={k.color ?? cols[i % cols.length]} strokeWidth={2} fill={k.color ?? cols[i % cols.length]} fillOpacity={i === 0 ? 0.08 : 0} dot={false} activeDot={{ r: 3.5 }} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 180, fmt = fmtN }) {
  const m = useMounted();
  if (!m) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={1.5} stroke="none" isAnimationActive={false}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip {...tip} formatter={(v) => fmt(v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HBar({ label, value, pct, sub, tone = "accent", right }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12.5px]"><span className="truncate pr-2">{label}</span><span className="num font-medium">{right ?? value}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-panel"><div className={cn("h-full rounded-full", tone === "ok" ? "bg-ok" : tone === "bad" ? "bg-bad" : tone === "warn" ? "bg-warn" : tone === "info" ? "bg-info" : "bg-accent")} style={{ width: `${Math.min(100, pct)}%` }} /></div>
      {sub && <div className="mt-0.5 text-[11.5px] text-faint">{sub}</div>}
    </div>
  );
}
