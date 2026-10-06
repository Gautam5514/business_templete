"use client";
import { Bar as RBar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Line, ReferenceLine, Cell } from "recharts";
import { BUDGET_TOTALS, COST_CATS, CASHFLOW_PROJECT, LEAKS, PROFIT } from "@/data/ops";
import { getProject, PROJECTS } from "@/data/core";
import { Bar, Card, Insight, Kpi, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { cr } from "@/lib/format";
import { ChartTip, axis } from "@/components/ui/charts";

const fx = (pid) => (pid ? getProject(pid).value / 18.4 : 4.72);
export function BudgetSection({ pid }) {
  const f = fx(pid), p = pid ? getProject(pid) : null;
  const t = Object.fromEntries(Object.entries(BUDGET_TOTALS).map(([k, v]) => [k, +(v * f).toFixed(2)]));
  if (p) { const k = p.budget / 58; t.actual = +(9.6 * f * k).toFixed(2); t.committed = +(10.2 * f * k).toFixed(2); t.remaining = +(t.budget - t.actual).toFixed(2); t.forecast = +(t.budget * (1 + (p.status === "On Track" ? 0.01 : p.status === "Delayed" ? 0.09 : p.status === "Cost Risk" ? 0.12 : 0.06))).toFixed(2); t.variance = +(t.forecast - t.budget).toFixed(2); }
  if (pid === "skyline") Object.assign(t, BUDGET_TOTALS);
  const rows = COST_CATS.map((c) => ({ ...c, budget: +(c.budget * f).toFixed(2), committed: +(c.committed * f).toFixed(2), actual: +(c.actual * f).toFixed(2), forecast: +(c.forecast * f).toFixed(2), id: c.cat }));
  const over = t.variance > 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Project budget" value={cr(t.budget)} />
        <Kpi label="Committed" value={cr(t.committed)} sub="POs + work orders issued" />
        <Kpi label="Actual spent" value={cr(t.actual)} tone="accent" sub={`${((t.actual / t.budget) * 100).toFixed(0)}% of budget`} />
        <Kpi label="Remaining" value={cr(t.remaining)} />
        <Kpi label="Forecast final cost" value={cr(t.forecast)} tone={over ? "risk" : "good"} />
        <Kpi label="Variance" value={`${over ? "+" : "−"}₹${Math.abs(t.variance * 100).toFixed(0)}L`} tone={over ? "bad" : "good"} sub={over ? "Expected overrun" : "Under budget"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Budget vs committed vs actual vs forecast" sub="By cost category · ₹ Cr">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rows} margin={{ left: -14 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="cat" {...axis} interval={0} tick={{ fontSize: 10, fill: "var(--mute)" }} angle={-20} textAnchor="end" height={54} /><YAxis {...axis} />
              <Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} /><Legend wrapperStyle={{ fontSize: 11.5 }} />
              <RBar dataKey="budget" name="Budget" fill="var(--line-strong)" radius={[2, 2, 0, 0]} /><RBar dataKey="actual" name="Actual" fill="var(--accent)" radius={[2, 2, 0, 0]} /><RBar dataKey="forecast" name="Forecast" fill="var(--risk)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Where the money has gone" sub="Share of actual spend">
          <div className="space-y-2">{[...rows].sort((a, b) => b.actual - a.actual).slice(0, 6).map((r) => (
            <div key={r.cat}><div className="mb-0.5 flex justify-between text-[12.5px]"><span>{r.cat}</span><span className="num font-semibold">{cr(r.actual, 2)}</span></div><Bar value={r.actual} max={rows[0].actual} h={5} /></div>))}</div>
          <div className="mt-3"><Insight tone={over ? "warn" : "accent"}>{pid === "skyline" || !pid ? "Material is trending ₹40L over budget, driven by TMT steel escalation (+6.2%). Contractor and labour costs are on plan." : over ? "Forecast is above budget. Review rate escalation and rework before the next RA bill." : "Spending is tracking inside the budget."}</Insight></div>
        </Card>
      </div>
      <Card title="Cost breakdown" pad={false}>
        <DataTable exportName="cost-breakdown" pageSize={12} dense columns={[
          { key: "cat", label: "Category", render: (r) => <b className="font-medium">{r.cat}</b> },
          { key: "budget", label: "Budget", align: "right", render: (r) => cr(r.budget, 2) },
          { key: "committed", label: "Committed", align: "right", render: (r) => cr(r.committed, 2) },
          { key: "actual", label: "Actual", align: "right", render: (r) => cr(r.actual, 2) },
          { key: "forecast", label: "Forecast", align: "right", render: (r) => cr(r.forecast, 2) },
          { key: "variance", label: "Variance", align: "right", sort: (r) => r.forecast - r.budget, render: (r) => { const v = r.forecast - r.budget; return <span className={v > 0.001 ? "text-bad" : "text-good"}>{v > 0.001 ? "+" : ""}{(v * 100).toFixed(0)}L</span>; }, csv: (r) => ((r.forecast - r.budget) * 100).toFixed(0) },
          { key: "use", label: "Used", render: (r) => <div className="w-24"><Bar value={(r.actual / r.budget) * 100} h={5} tone={r.actual / r.budget > 0.9 ? "bad" : "accent"} /></div>, csv: (r) => ((r.actual / r.budget) * 100).toFixed(0) + "%" },
        ]} rows={rows} />
      </Card>
    </div>
  );
}

export function ProjectCashflow({ pid }) {
  const f = pid ? getProject(pid).value / 18.4 : 4.72;
  const data = CASHFLOW_PROJECT.map((r) => ({ ...r, inflow: +(r.inflow * f).toFixed(2), material: -+(r.material * f).toFixed(2), contractor: -+(r.contractor * f).toFixed(2), labour: -+(r.labour * f).toFixed(2), overhead: -+(r.overhead * f).toFixed(2), net: +(r.net * f).toFixed(2) }));
  return (
    <Card title="Cash flow — inflow, outflow and net" sub="₹ Cr per month · Nov–Jan are forecast based on billing plan and committed POs">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} stackOffset="sign" margin={{ left: -10 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="m" {...axis} /><YAxis {...axis} /><ReferenceLine y={0} stroke="var(--ink)" />
          <ReferenceLine x="Oct" stroke="var(--faint)" strokeDasharray="3 3" label={{ value: "Today", fontSize: 10.5, fill: "var(--mute)", position: "top" }} />
          <Tooltip content={<ChartTip fmt={(v) => `₹${Math.abs(v)} Cr`} />} cursor={{ fill: "var(--panel)" }} /><Legend wrapperStyle={{ fontSize: 11.5 }} />
          <RBar dataKey="inflow" name="Client inflow" fill="var(--good)" stackId="s" barSize={30} />
          <RBar dataKey="material" name="Material" fill="var(--faint)" stackId="s" /><RBar dataKey="contractor" name="Contractor" fill="var(--info)" stackId="s" /><RBar dataKey="labour" name="Labour" fill="var(--warn)" stackId="s" /><RBar dataKey="overhead" name="Overhead" fill="var(--risk)" stackId="s" />
          <Line dataKey="net" name="Net cash flow" stroke="var(--ink)" strokeWidth={2.4} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function Profitability({ pid }) {
  const rows = PROFIT.filter((r) => !pid || r.id === pid).map((r) => ({ ...r, id: r.id }));
  return (
    <div className="space-y-4">
      {pid === "skyline" && (
        <Card title="Skyline Residency — will it finish profitably?" sub="Escalation recovery claimed from client offsets steel rate rise">
          <div className="grid gap-4 sm:grid-cols-4">
            {[["Contract value", "₹18.4 Cr"], ["Forecast cost (direct)", "₹16.4 Cr"], ["Escalation recovery", "−₹1.3 Cr"], ["Net forecast cost", "₹15.1 Cr"]].map(([k, v]) => <div key={k}><div className="text-[11px] uppercase tracking-wide text-faint">{k}</div><div className="num text-[20px] font-semibold">{v}</div></div>)}
          </div>
          <div className="mt-4 flex items-center gap-4 rounded-[6px] bg-good-soft p-3"><div className="num text-[30px] font-semibold text-good">17.9%</div><div className="text-[13px]">Projected margin · <b>₹3.3 Cr</b> gross profit. Yes — this project finishes profitably.</div></div>
        </Card>
      )}
      <DataTable exportName="profitability" dense pageSize={8} columns={[
        { key: "name", label: "Project", render: (r) => <b className="font-medium">{r.name}</b> },
        { key: "contract", label: "Contract", align: "right", render: (r) => cr(r.contract) },
        { key: "estimated", label: "Estimated cost", align: "right", render: (r) => cr(r.estimated) },
        { key: "actual", label: "Actual cost", align: "right", render: (r) => cr(r.actual) },
        { key: "forecast", label: "Forecast cost", align: "right", render: (r) => cr(r.forecast) },
        { key: "revenue", label: "Revenue recognised", align: "right", render: (r) => cr(r.revenue) },
        { key: "gp", label: "Gross profit", align: "right", render: (r) => cr(r.gp) },
        { key: "margin", label: "Margin", align: "right", render: (r) => <span className={cn("font-semibold", r.margin < 10 ? "text-risk" : "text-good")}>{r.margin}%</span> },
      ]} rows={rows} />
    </div>
  );
}

export function ProfitLeaks({ pid }) {
  const entries = Object.entries(LEAKS).filter(([k]) => !pid || k === pid);
  if (!entries.length) return <div className="rounded-[8px] border border-dashed border-line-strong p-8 text-center text-mute">No profit leaks detected for this project. 🎯</div>;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {entries.map(([k, v]) => (
        <Card key={k} title={`${getProject(k).name} may exceed its budget by ₹${v.total}L`} sub="AI-detected profit leak with root causes">
          <div className="space-y-2.5">{v.items.map(([n, a]) => <div key={n}><div className="mb-1 flex justify-between text-[12.5px]"><span>{n}</span><span className="num font-semibold text-bad">₹{a}L</span></div><Bar value={a} max={v.items[0][1]} tone="risk" h={6} /></div>)}</div>
        </Card>
      ))}
    </div>
  );
}
