"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Btn, Card, Field, Input, Kpi, PageHeader, Pill, Progress, Select, Tabs, Textarea, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { LINES, MACHINES, SHIFTS, EMPLOYEES } from "@/data/masters";
import { fdt, num } from "@/lib/format";

const tone = { Running: "border-ok/30", Paused: "border-warn/40", Maintenance: "border-warn/40", Breakdown: "border-bad/40" };
const dotC = { Running: "bg-ok", Paused: "bg-warn", Maintenance: "bg-warn", Breakdown: "bg-bad" };

function Live() {
  const [lines, setLines] = useState(LINES);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => { setTick((x) => x + 1); setLines((ls) => ls.map((l) => l.status === "Running" ? { ...l, produced: Math.min(l.target, l.produced + Math.ceil(Math.random() * 3)), today: l.today + 1 } : l)); }, 3000);
    return () => clearInterval(t);
  }, []);
  void tick;
  const sum = lines.reduce((s, l) => s + l.today, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-[13px]"><span className="flex items-center gap-1.5 text-ok"><span className="live-dot h-2 w-2 rounded-full bg-ok" />Live</span><span className="text-mute">Updated every few seconds from machine counters and supervisor entries</span></div>
        <div className="num text-[13px] text-mute">All lines today: <b className="text-ink">{num(sum)}</b> units</div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lines.map((l) => (
          <div key={l.id} className={cn("rounded-[8px] border bg-surface p-4", tone[l.status])}>
            <div className="flex items-start justify-between gap-3">
              <div><div className="flex items-center gap-2 text-[16px] font-semibold"><span className={cn("h-2.5 w-2.5 rounded-full", dotC[l.status], l.status === "Running" && "live-dot")} />{l.name}<span className="text-[12px] font-normal text-mute">· {l.plant}</span></div><div className="mt-0.5 text-[13px] text-mute">{l.product} · <Link href={`/production/${l.wo}`} className="font-medium text-ink hover:underline">{l.wo}</Link></div></div>
              <Pill>{l.status}</Pill>
            </div>
            <div className="mt-4 flex items-end justify-between"><div><div className="label">Produced / target</div><div className="num text-[28px] font-semibold leading-8 tracking-[-0.02em]">{num(l.produced)} <span className="text-[16px] font-normal text-mute">/ {num(l.target)}</span></div></div><div className="text-right"><div className="label">Efficiency</div><div className={cn("num text-[22px] font-semibold", l.eff && l.eff < 80 && "text-warn", !l.eff && "text-faint")}>{l.status === "Maintenance" ? "—" : `${l.eff}%`}</div></div></div>
            <Progress value={l.produced} max={l.target} tone={l.status === "Running" ? "ok" : "warn"} className="mt-2" />
            {(l.reason || l.restart) && <div className="mt-3 rounded-[6px] bg-warn-soft px-3 py-2 text-[12.5px] text-warn">{l.reason ? <>Paused — <b>{l.reason}</b> · downtime <b>{l.downMin} min</b></> : <>Under maintenance — expected restart <b>{l.restart}</b></>}</div>}
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3 text-[12.5px]"><div><div className="label !text-[10px]">Current shift</div>{l.shift}</div><div><div className="label !text-[10px]">Supervisor</div>{l.sup}</div><div><div className="label !text-[10px]">Machines</div>{l.machines.join(" · ")}</div></div>
            <div className="mt-2 text-[12px] text-mute">{l.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Shifts() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {SHIFTS.map((s) => (
          <Card key={s.id} title={`${s.id} shift`} sub={s.time} action={s.upcoming ? <Pill tone="info">Starts 02:00 PM</Pill> : s.prev ? <Pill tone="neutral">Completed</Pill> : <Pill tone="ok">Live</Pill>}>
            <div className="num text-[26px] font-semibold tracking-[-0.02em]">{num(s.actual)} <span className="text-[14px] font-normal text-mute">/ {num(s.target)}</span></div>
            <Progress value={s.actual} max={s.target} tone={s.actual >= s.target * 0.9 ? "ok" : "warn"} className="mt-2" />
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[12.5px]">{[["Accepted", num(s.accepted)], ["Rejected", num(s.rejected)], ["Downtime", `${s.down} min`], ["Operators", s.ops], ["Efficiency", s.eff ? `${s.eff}%` : "—"], ["Supervisor", s.sup]].map(([k, v]) => <div key={k}><dt className="label !text-[10px]">{k}</dt><dd className="num">{v}</dd></div>)}</dl>
          </Card>
        ))}
      </div>
      <Card title="Shift output vs target — last 7 days"><BarsChart data={[["30 Sep", 2600, 2700, 2000, 2000], ["01 Oct", 2510, 2700, 2210, 2000], ["02 Oct", 2720, 2700, 2090, 2000], ["03 Oct", 2480, 2700, 1820, 2000], ["04 Oct", 2650, 2700, 2010, 2000], ["05 Oct", 2690, 2700, 2300, 2000], ["06 Oct", 2480, 2700, 2380, 2000]].map(([label, m, mt, n]) => ({ label, Morning: m, Evening: mt, Night: n }))} keys={[{ k: "Morning", name: "Morning" }, { k: "Evening", name: "Evening" }, { k: "Night", name: "Night" }]} height={240} colors={[C.accent, C.soft, C.warn]} /></Card>
    </div>
  );
}

const LOSS = ["None", "Machine Breakdown", "Tool Change", "Material Shortage", "Power Failure", "Operator Unavailable", "Quality Issue", "Maintenance", "Setup / Changeover", "Other"];
function Entry() {
  const { wos, addProduction, entries, toast } = useStore();
  const run = wos.filter((w) => ["Running", "Paused", "Ready", "Material Pending"].includes(w.status));
  const [f, setF] = useState({ wo: "WO-2841", machine: "HP-03", operator: "Kailash Mahto", produced: 250, accepted: 240, rejected: 10, scrap: 8, start: "11:20", stop: "12:20", loss: "None", note: "" });
  const w = wos.find((x) => x.id === f.wo);
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((p) => { const n = { ...p, [k]: v }; if (k === "produced" || k === "rejected") n.accepted = Math.max(0, (+n.produced || 0) - (+n.rejected || 0)); return n; });
  };
  const mism = +f.accepted + +f.rejected !== +f.produced;
  const submit = () => {
    if (!(+f.produced > 0)) return toast("Enter a produced quantity", "bad");
    if (mism) return toast("Accepted + rejected must equal produced", "bad");
    addProduction(f);
    toast("Production recorded", "ok", `${f.wo}: +${f.produced} units — now ${num(w.produced + +f.produced)} of ${num(w.planned)}`);
    setF({ ...f, produced: 0, accepted: 0, rejected: 0, scrap: 0, note: "" });
  };
  const seed = [["10:00 – 11:00", "WO-2841", "HP-03", "Kailash Mahto", 350, 340, 10], ["09:00 – 10:00", "WO-2841", "P-04", "Ramesh Oraon", 280, 262, 18], ["10:30 – 11:15", "WO-2838", "HP-01", "Pappu Kumar", 410, 402, 8]];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,460px)_1fr]">
      <Card title="Enter production" sub="Add an incremental update during the shift">
        <div className="space-y-3">
          <Field label="Work order"><Select value={f.wo} onChange={set("wo")}>{run.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.short}</option>)}</Select></Field>
          {w && <div className="rounded-[6px] bg-bg px-3 py-2 text-[12.5px] text-mute">Produced so far <b className="num text-ink">{num(w.produced)}</b> of {num(w.planned)} · remaining <b className="num text-ink">{num(w.remaining)}</b></div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Machine"><Select value={f.machine} onChange={set("machine")}>{MACHINES.map((m) => <option key={m.id}>{m.id}</option>)}</Select></Field>
            <Field label="Operator"><Select value={f.operator} onChange={set("operator")}>{EMPLOYEES.filter((e) => /Operator|Welder|Polisher/.test(e.role)).map((e) => <option key={e.id}>{e.name}</option>)}</Select></Field>
            <Field label="Produced qty"><Input type="number" inputMode="numeric" value={f.produced} onChange={set("produced")} /></Field>
            <Field label="Accepted qty"><Input type="number" inputMode="numeric" value={f.accepted} onChange={set("accepted")} /></Field>
            <Field label="Rejected qty"><Input type="number" inputMode="numeric" value={f.rejected} onChange={set("rejected")} /></Field>
            <Field label="Scrap (kg)"><Input type="number" inputMode="decimal" value={f.scrap} onChange={set("scrap")} /></Field>
            <Field label="Start time"><Input type="time" value={f.start} onChange={set("start")} /></Field>
            <Field label="Stop time"><Input type="time" value={f.stop} onChange={set("stop")} /></Field>
          </div>
          <Field label="Reason for loss"><Select value={f.loss} onChange={set("loss")}>{LOSS.map((x) => <option key={x}>{x}</option>)}</Select></Field>
          <Field label="Notes"><Textarea rows={2} value={f.note} onChange={set("note")} placeholder="Anything the next shift should know…" /></Field>
          {mism && <div className="rounded-[6px] bg-warn-soft px-3 py-2 text-[12.5px] text-warn">Accepted + rejected ({+f.accepted + +f.rejected}) doesn’t match produced ({+f.produced}).</div>}
          <Btn variant="primary" size="md" className="h-10 w-full" icon={<Check size={15} />} onClick={submit}>Save production entry</Btn>
        </div>
      </Card>
      <div className="min-w-0 space-y-4">
        <Card title="Entries this shift" pad={false}>
          <DataTable rows={[...entries.map((e, i) => ({ k: `n${i}`, t: "Just now", wo: e.wo, m: e.machine, o: e.operator, p: e.produced, a: e.accepted, r: e.rejected })), ...seed.map((e, i) => ({ k: `s${i}`, t: e[0], wo: e[1], m: e[2], o: e[3], p: e[4], a: e[5], r: e[6] }))]} rowKey={(r) => r.k} pageSize={10} cols={[{ key: "t", header: "Time" }, { key: "wo", header: "Work order" }, { key: "m", header: "Machine" }, { key: "o", header: "Operator", muted: true }, { key: "p", header: "Produced", align: "right", render: (r) => num(r.p) }, { key: "a", header: "Accepted", align: "right", render: (r) => num(r.a) }, { key: "r", header: "Rejected", align: "right", render: (r) => <span className={r.r > 12 ? "text-bad" : ""}>{r.r}</span> }]} />
        </Card>
        <p className="text-[12px] text-faint">Entries update the work order, shift totals, WIP and plant dashboard immediately — no end-of-day Excel consolidation.</p>
      </div>
    </div>
  );
}

export default function Lines() {
  const [tab, setTab] = useTab(["live", "shifts", "entry"], "live");
  return (
    <div>
      <PageHeader title={tab === "live" ? "Live Shop Floor" : "Production Lines"} sub="Line status, shift performance and supervisor entry." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "live", label: "Live shop floor" }, { id: "shifts", label: "Shift management" }, { id: "entry", label: "Production entry" }]} />
      {tab === "live" && <Live />}{tab === "shifts" && <Shifts />}{tab === "entry" && <Entry />}
    </div>
  );
}
void Kpi; void fdt;
