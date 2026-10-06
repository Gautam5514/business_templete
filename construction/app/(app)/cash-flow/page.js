"use client";
import { useState } from "react";
import { Bar as RBar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { AGEING, COMPANY_FLOW, PROJECTS } from "@/data/core";
import { CashWaterfall } from "@/components/dashboard/parts";
import { BudgetSection, ProjectCashflow, Profitability, ProfitLeaks } from "@/components/finance/Budget";
import { Card, Counter, Insight, PageHead, Seg } from "@/components/ui/ui";
import { ChartTip, axis } from "@/components/ui/charts";
import { cr } from "@/lib/format";

export default function CashFlowPage() {
  const [tab, setTab] = useState("money"), [pid, setPid] = useState("skyline");
  const data = PROJECTS.map((p) => ({ n: p.name.split(" ").slice(0, 2).join(" "), Earned: p.earned, Billed: p.billed, Collected: p.collected, Spent: p.spent }));
  const flow = COMPANY_FLOW.map((r) => ({ ...r, Net: +(r.Inflow - r.Outflow).toFixed(2) }));
  return (
    <div className="space-y-5">
      <PageHead icon={TrendingUp} title="Budget & cash flow control" sub="Where the money was budgeted, spent, billed and collected." actions={<Seg options={[{ key: "money", label: "Money flow" }, { key: "budget", label: "Budget control" }, { key: "profit", label: "Profitability" }]} value={tab} onChange={setTab} />} />
      {tab === "money" && (<>
        <div className="grid overflow-hidden rounded-[8px] border border-line bg-surface sm:grid-cols-3">
          {[["Work done", "₹47.8 Cr", "text-ink"], ["Billed", "₹39.4 Cr", "text-ink"], ["Collected", "₹31.8 Cr", "text-good"]].map(([l, v, c], i) => <div key={l} className="border-b border-line p-5 sm:border-b-0 sm:border-r last:border-0"><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">{l}</div><div className={`num display mt-1 text-[40px] font-semibold leading-none ${c}`}>{v}</div></div>)}
        </div>
        <Insight>₹47.8 Cr worth of work has been completed, ₹39.4 Cr has been billed and ₹31.8 Cr has actually been collected. <b>₹16 Cr of work is yet to turn into cash</b> — ₹8.4 Cr unbilled, ₹2.7 Cr under client query, ₹4.9 Cr certified but unpaid.</Insight>
        <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <Card title="Work kiya kitna vs paisa mila kitna"><CashWaterfall /></Card>
          <Card title="Receivable ageing" sub="₹7.6 Cr pending from clients">
            <ResponsiveContainer width="100%" height={230}><BarChart data={AGEING} margin={{ left: -10 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="b" {...axis} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} /><RBar dataKey="v" barSize={36} radius={[3, 3, 0, 0]}>{AGEING.map((_, i) => <Cell key={i} fill={["var(--good)", "var(--warn)", "var(--risk)", "var(--bad)"][i]} />)}</RBar></BarChart></ResponsiveContainer>
          </Card>
        </div>
        <Card title="Earned vs billed vs collected vs spent — by project" sub="₹ Cr · the gap between the bars is where cash is stuck">
          <ResponsiveContainer width="100%" height={300}><BarChart data={data} margin={{ left: -14 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="n" {...axis} interval={0} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} /><Legend wrapperStyle={{ fontSize: 11.5 }} />
            <RBar dataKey="Earned" fill="var(--accent)" radius={[2, 2, 0, 0]} /><RBar dataKey="Billed" fill="var(--info)" radius={[2, 2, 0, 0]} /><RBar dataKey="Collected" fill="var(--good)" radius={[2, 2, 0, 0]} /><RBar dataKey="Spent" fill="var(--faint)" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer>
        </Card>
        <Card title="Company cash flow & forecast" sub="Inflow vs outflow, ₹ Cr per month — Nov to Jan forecast">
          <ResponsiveContainer width="100%" height={280}><ComposedChart data={flow} margin={{ left: -14 }}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="m" {...axis} /><YAxis {...axis} /><ReferenceLine y={0} stroke="var(--ink)" /><ReferenceLine x="Oct" stroke="var(--faint)" strokeDasharray="3 3" label={{ value: "Today", fontSize: 10.5, fill: "var(--mute)", position: "top" }} />
            <Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} /><Legend wrapperStyle={{ fontSize: 11.5 }} /><RBar dataKey="Inflow" fill="var(--good)" barSize={16} radius={[2, 2, 0, 0]} /><RBar dataKey="Outflow" fill="var(--faint)" barSize={16} radius={[2, 2, 0, 0]} /><Line dataKey="Net" stroke="var(--ink)" strokeWidth={2.4} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer>
        </Card>
      </>)}
      {tab !== "money" && <div><select value={pid} onChange={(e) => setPid(e.target.value)} className="mb-4 h-8 rounded-[6px] border border-line-strong bg-surface px-2 text-[12.5px]">{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        {tab === "budget" && <div className="space-y-5"><BudgetSection pid={pid} /><ProjectCashflow pid={pid} /></div>}{tab === "profit" && <div className="space-y-5"><Profitability pid={pid} /><ProfitLeaks pid={pid} /></div>}</div>}
    </div>
  );
}
