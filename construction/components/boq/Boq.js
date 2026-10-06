"use client";
import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BOQ } from "@/data/ops";
import { getProject } from "@/data/core";
import { Bar, Card, Kpi, cn } from "@/components/ui/ui";
import { inr, num } from "@/lib/format";
import { Cell, Bar as RBar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTip, axis } from "@/components/ui/charts";

export function BoqSection({ pid }) {
  const f = pid ? getProject(pid).value / 18.4 : 1;
  const pf = pid ? getProject(pid).pct / 62 : 1;
  const [open, setOpen] = useState(new Set(["1", "2"]));
  const groups = BOQ.map((g) => ({
    ...g,
    items: g.items.map((i) => {
      const qty = Math.round(i.qty * f * 100) / 100, exec = Math.min(qty, Math.round(i.exec * f * pf * 100) / 100);
      const budget = qty * i.rate, execVal = exec * i.rate;
      return { ...i, qty, exec, budget, execVal, balance: qty - exec, billedQ: Math.min(exec, i.billed * f * pf), variance: i.hl ? 0.9e5 * f : Math.round(Math.sin(i.qty) * 0.03 * execVal) };
    }),
  }));
  groups.forEach((g) => { g.budget = g.items.reduce((a, i) => a + i.budget, 0); g.execVal = g.items.reduce((a, i) => a + i.execVal, 0); });
  const tb = groups.reduce((a, g) => a + g.budget, 0), te = groups.reduce((a, g) => a + g.execVal, 0);
  const tog = (c) => { const n = new Set(open); n.has(c) ? n.delete(c) : n.add(c); setOpen(n); };
  const chart = groups.map((g) => ({ n: g.cat, Budget: +(g.budget / 1e7).toFixed(2), Executed: +(g.execVal / 1e7).toFixed(2) }));
  const rcc = BOQ[0].items[2];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="BOQ value" value={inr(tb)} sub={`${groups.reduce((a, g) => a + g.items.length, 0)} line items`} />
        <Kpi label="Executed" value={inr(te)} sub={`${((te / tb) * 100).toFixed(0)}% of BOQ value`} tone="accent" />
        <Kpi label="Balance work" value={inr(tb - te)} sub="Still to be executed" />
        <Kpi label="Billing gap" value={inr(te * 0.14)} sub="Executed but not billed to client" tone="warn" />
      </div>
      {!pid || pid === "skyline" ? <div className="rounded-[8px] border border-accent/25 bg-accent-soft px-4 py-3 text-[13px]"><b>RCC M30 · {rcc.code}</b> — {num(rcc.exec)} of {num(rcc.qty)} CUM executed ({num(rcc.qty - rcc.exec)} CUM remaining). Budget ₹3.28 Cr, actual to date ₹2.06 Cr.</div> : null}
      <Card pad={false} title="Bill of quantities" sub="Click a category to expand line items">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-panel"><tr className="border-b border-line text-[10.5px] font-semibold uppercase tracking-[0.05em] text-faint">
              {["Code", "Description", "Unit", "BOQ Qty", "Rate (₹)", "Budget", "Exec. Qty", "Exec. Value", "Billed Qty", "Balance", "Variance", "Progress"].map((h, i) => <th key={h} className={cn("px-3 py-2", i > 2 && i < 11 && "text-right")}>{h}</th>)}</tr></thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g.code}>
                  <tr onClick={() => tog(g.code)} className="cursor-pointer border-b border-line bg-panel/60 hover:bg-panel">
                    <td className="px-3 py-2 font-semibold"><ChevronDown size={13} className={cn("mr-1 inline transition-transform", !open.has(g.code) && "-rotate-90")} />{g.code}</td>
                    <td className="px-3 py-2 font-semibold" colSpan={4}>{g.cat}</td>
                    <td className="num px-3 py-2 text-right font-semibold">{inr(g.budget)}</td><td />
                    <td className="num px-3 py-2 text-right font-semibold">{inr(g.execVal)}</td><td /><td /><td />
                    <td className="px-3 py-2"><Bar value={(g.execVal / g.budget) * 100} h={5} /></td>
                  </tr>
                  {open.has(g.code) && g.items.map((i) => (
                    <tr key={i.code} className={cn("border-b border-line/60 hover:bg-panel", i.hl && "bg-accent-soft/40")}>
                      <td className="num px-3 py-2 pl-8 text-mute">{i.code}</td><td className="px-3 py-2">{i.desc}</td><td className="px-3 py-2 text-mute">{i.unit}</td>
                      <td className="num px-3 py-2 text-right">{num(i.qty)}</td><td className="num px-3 py-2 text-right">{num(i.rate)}</td><td className="num px-3 py-2 text-right">{inr(i.budget)}</td>
                      <td className="num px-3 py-2 text-right">{num(i.exec, i.exec % 1 ? 1 : 0)}</td><td className="num px-3 py-2 text-right">{inr(i.execVal)}</td>
                      <td className="num px-3 py-2 text-right">{num(i.billedQ)}</td><td className="num px-3 py-2 text-right">{num(i.balance)}</td>
                      <td className={cn("num px-3 py-2 text-right", i.variance > 0 ? "text-bad" : "text-good")}>{i.variance === 0 ? "—" : `${i.variance > 0 ? "+" : "−"}${inr(Math.abs(i.variance))}`}</td>
                      <td className="px-3 py-2"><Bar value={(i.exec / i.qty) * 100} h={5} tone={i.exec / i.qty > 0.95 ? "good" : "accent"} /></td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Budget vs executed by trade" sub="₹ Cr">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chart} margin={{ left: -10 }}><XAxis dataKey="n" {...axis} interval={0} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} />
            <RBar dataKey="Budget" fill="var(--line-strong)" radius={[2, 2, 0, 0]} /><RBar dataKey="Executed" fill="var(--accent)" radius={[2, 2, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
