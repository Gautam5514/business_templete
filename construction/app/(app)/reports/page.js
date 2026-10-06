"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bar as RBar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { AGEING, PROJECTS } from "@/data/core";
import { CONTRACTORS, MATERIALS, PRODUCTIVITY } from "@/data/ops";
import { EvmPanel, SCurve } from "@/components/projects/Charts";
import { ProfitLeaks, Profitability } from "@/components/finance/Budget";
import { Card, PageHead, Seg } from "@/components/ui/ui";
import { ChartTip, axis } from "@/components/ui/charts";

function Body() {
  const sp = useSearchParams();
  const [tab, setTab] = useState(sp.get("tab") === "leaks" ? "leaks" : "all");
  const bva = PROJECTS.map((p) => ({ n: p.name.split(" ")[0], Budget: +(p.value * (1 - p.margin / 100) * 0.9).toFixed(1), Actual: p.spent }));
  const mat = ["Cement OPC 53", "TMT Steel (all dia.)"].map((m) => ({ n: m.split(" ")[0], ...Object.fromEntries(PROJECTS.map((p) => [p.name.split(" ")[0], MATERIALS.find((x) => x.p === p.id && x.name === m)?.consumed ?? 0])) }));
  const pay = CONTRACTORS.map((c) => ({ n: c.name.split(" ")[0], Pending: +(c.pending * 100).toFixed(0), Retention: +(c.retention * 100).toFixed(1) }));
  const prod = PRODUCTIVITY.map((x) => ({ n: x.team.split(" ")[0], Target: 100, Actual: Math.round((x.actual / x.target) * 100) }));
  return (
    <div className="space-y-5">
      <PageHead icon={BarChart3} title="Reports" sub="Charts that answer a business question — nothing decorative." actions={<Seg options={[{ key: "all", label: "Business reports" }, { key: "leaks", label: "Profit leak detection" }]} value={tab} onChange={setTab} />} />
      {tab === "leaks" ? (<><ProfitLeaks /><Profitability /></>) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card title="Skyline S-curve" sub="Are we ahead or behind plan?"><SCurve height={260} /></Card>
          <Card title="Earned value" sub="Skyline · time and cost, in plain words"><EvmPanel /></Card>
          <Card title="Budget vs actual by project" sub="₹ Cr — who is spending ahead of plan?"><ResponsiveContainer width="100%" height={260}><BarChart data={bva} margin={{ left: -12 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="n" {...axis} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} /><Legend wrapperStyle={{ fontSize: 11.5 }} /><RBar dataKey="Budget" fill="var(--line-strong)" radius={[2, 2, 0, 0]} /><RBar dataKey="Actual" fill="var(--accent)" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></Card>
          <Card title="Client receivable ageing" sub="₹ Cr"><ResponsiveContainer width="100%" height={260}><BarChart data={AGEING} margin={{ left: -12 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="b" {...axis} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} /><RBar dataKey="v" barSize={40} radius={[3, 3, 0, 0]}>{AGEING.map((_, i) => <Cell key={i} fill={["var(--good)", "var(--warn)", "var(--risk)", "var(--bad)"][i]} />)}</RBar></BarChart></ResponsiveContainer></Card>
          <Card title="Material consumption" sub="Cement (bags) and steel (MT) consumed by project"><ResponsiveContainer width="100%" height={260}><BarChart data={mat} margin={{ left: 4 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="n" {...axis} /><YAxis {...axis} /><Tooltip content={<ChartTip />} cursor={{ fill: "var(--panel)" }} /><Legend wrapperStyle={{ fontSize: 11 }} />{PROJECTS.map((p, i) => <RBar key={p.id} dataKey={p.name.split(" ")[0]} fill={["var(--accent)", "var(--info)", "var(--good)", "var(--warn)", "var(--risk)", "var(--faint)", "var(--bad)"][i]} />)}</BarChart></ResponsiveContainer></Card>
          <Card title="Labour productivity" sub="Actual output as % of target"><ResponsiveContainer width="100%" height={260}><BarChart data={prod} margin={{ left: -12 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="n" {...axis} /><YAxis {...axis} unit="%" /><Tooltip content={<ChartTip suffix="%" />} cursor={{ fill: "var(--panel)" }} /><RBar dataKey="Actual" barSize={36} radius={[3, 3, 0, 0]}>{prod.map((p, i) => <Cell key={i} fill={p.Actual >= 95 ? "var(--good)" : p.Actual >= 80 ? "var(--warn)" : "var(--bad)"} />)}</RBar></BarChart></ResponsiveContainer></Card>
          <Card title="Contractor payable" sub="₹ Lakh pending + retention held"><ResponsiveContainer width="100%" height={260}><BarChart data={pay} margin={{ left: -12 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="n" {...axis} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `₹${v}L`} />} cursor={{ fill: "var(--panel)" }} /><Legend wrapperStyle={{ fontSize: 11.5 }} /><RBar dataKey="Pending" stackId="a" fill="var(--risk)" /><RBar dataKey="Retention" stackId="a" fill="var(--faint)" /></BarChart></ResponsiveContainer></Card>
        </div>
      )}
    </div>
  );
}
export default function Reports() { return <Suspense><Body /></Suspense>; }
