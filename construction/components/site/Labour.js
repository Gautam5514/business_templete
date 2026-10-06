"use client";
import { Bar as RBar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DEPLOY, LABOUR_TODAY, PRODUCTIVITY, WORKERS } from "@/data/ops";
import { getProject, projName } from "@/data/core";
import { Bar, Card, Kpi, Pill, Ring, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { rs } from "@/lib/format";
import { ChartTip, axis } from "@/components/ui/charts";

export function LabourSection({ pid }) {
  const s = LABOUR_TODAY, p = pid && getProject(pid);
  const k = p ? p.workers / 286 : 1;
  const sc = (n) => Math.round(n * k);
  const workers = WORKERS.filter((w) => !pid || w.p === pid);
  const prod = PRODUCTIVITY.filter((x) => !pid || x.p === pid);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="Workers today" value={sc(s.total)} /><Kpi label="Present" value={sc(s.present)} tone="good" sub={`${Math.round((s.present / s.total) * 100)}% attendance`} /><Kpi label="Absent" value={sc(s.absent)} tone="bad" /><Kpi label="Skilled" value={sc(s.skilled)} /><Kpi label="Unskilled" value={sc(s.unskilled)} /><Kpi label="Overtime" value={sc(s.overtime)} tone="warn" sub="workers on OT" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card title="Live site workforce" sub="Where manpower is deployed right now">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={DEPLOY.map((d) => ({ ...d, v: sc(d.v) }))} layout="vertical" margin={{ left: 6, right: 20 }}><XAxis type="number" hide /><YAxis type="category" dataKey="k" width={70} {...axis} /><Tooltip content={<ChartTip fmt={(v) => `${v} workers`} />} cursor={{ fill: "var(--panel)" }} />
              <RBar dataKey="v" radius={[0, 2, 2, 0]} barSize={18} label={{ position: "right", fontSize: 11, fill: "var(--mute)" }}>{DEPLOY.map((_, i) => <Cell key={i} fill={i < 3 ? "var(--accent)" : "var(--faint)"} />)}</RBar></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Productivity" sub="Target vs actual output by crew today">
          {prod.length === 0 ? <div className="py-8 text-center text-mute">No crew productivity logged for this project today.</div> : (
            <div className="space-y-4">{prod.map((x) => { const pc = (x.actual / x.target) * 100; return (
              <div key={x.team} className="flex items-center gap-4"><Ring size={64} stroke={7} value={Math.min(100, pc)} tone={pc >= 95 ? "good" : pc >= 80 ? "warn" : "bad"} label={`${pc.toFixed(0)}%`} />
                <div className="flex-1"><div className="flex justify-between"><span className="text-[13px] font-semibold">{x.team}</span><span className="num text-[12px] text-mute">{x.workers} workers</span></div>
                  <div className="text-[12px] text-mute">Target {x.target} {x.unit} · Actual <b className="text-ink">{x.actual} {x.unit}</b> · {rs(x.cost)}/{x.unit}</div>
                  <div className="mt-1 text-[12px]">{pc >= 100 ? "Ahead of target." : `Producing ${(100 - pc).toFixed(0)}% less than target — ${x.target - x.actual > 0 ? (x.target - x.actual).toFixed(x.target < 10 ? 1 : 0) : 0} ${x.unit} short.`}</div></div></div>); })}</div>
          )}
        </Card>
      </div>
      <Card pad={false} title="Workers" action={<Pill tone="mute" dot={false}>Sample of 286</Pill>}>
        <DataTable exportName="labour" dense pageSize={8} searchKeys={["name", "contractor", "skill"]} filters={[{ key: "att", label: "Attendance", options: ["Present", "Absent"] }, { key: "shift", label: "Shift", options: ["Day", "Night"] }]} columns={[
          { key: "name", label: "Worker", render: (r) => <b className="font-medium">{r.name}</b> }, { key: "contractor", label: "Contractor" }, { key: "skill", label: "Skill" },
          ...(pid ? [] : [{ key: "p", label: "Site", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
          { key: "shift", label: "Shift" }, { key: "att", label: "Attendance", render: (r) => <Pill tone={r.att === "Present" ? "good" : "bad"}>{r.att}</Pill>, csv: (r) => r.att },
          { key: "ot", label: "OT hrs", align: "right" }, { key: "rate", label: "Rate/day", align: "right", render: (r) => rs(r.rate) },
          { key: "cost", label: "Cost today", align: "right", render: (r) => (r.att === "Present" ? rs(r.rate + r.ot * (r.rate / 8) * 1.5) : "—"), sort: (r) => (r.att === "Present" ? r.rate + r.ot * (r.rate / 8) * 1.5 : 0), csv: (r) => (r.att === "Present" ? Math.round(r.rate + r.ot * (r.rate / 8) * 1.5) : 0) },
        ]} rows={workers} />
      </Card>
    </div>
  );
}
