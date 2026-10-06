"use client";
import { useState } from "react";
import { AlertTriangle, Check, Camera, FolderOpen, Paperclip, Receipt } from "lucide-react";
import { DRAWINGS, EXPENSES, FOLDERS, PETTY, TASKS } from "@/data/ops";
import { ACTIVITY, getProject, projName, PROJECTS } from "@/data/core";
import { Bar, Btn, Card, Kpi, Pill, Seg, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { num, rs } from "@/lib/format";
import { useStore } from "@/lib/store";

export function ExpensesSection({ pid }) {
  const rows = EXPENSES.filter((e) => !pid || e.p === pid), pc = PETTY.filter((x) => !pid || x.p === pid);
  const sum = (k) => pc.reduce((a, r) => a + r[k], 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5"><Kpi label="Opening" value={rs(sum("opening"))} /><Kpi label="Received" value={rs(sum("received"))} /><Kpi label="Spent" value={rs(sum("spent"))} tone="accent" /><Kpi label="Balance" value={rs(sum("balance"))} tone="good" /><Kpi label="Receipts pending" value={sum("pending")} tone="warn" sub="Upload to settle" /></div>
      <Card title="Petty cash — site wise" pad={false}>
        <DataTable dense exportName="petty-cash" pageSize={7} columns={[{ key: "p", label: "Site", render: (r) => <b className="font-medium">{projName(r.p)}</b> }, { key: "opening", label: "Opening", align: "right", render: (r) => rs(r.opening) }, { key: "received", label: "Received", align: "right", render: (r) => rs(r.received) }, { key: "spent", label: "Spent", align: "right", render: (r) => rs(r.spent) }, { key: "balance", label: "Balance", align: "right", render: (r) => <b>{rs(r.balance)}</b> }, { key: "use", label: "Used", render: (r) => <div className="w-24"><Bar value={(r.spent / (r.opening + r.received)) * 100} h={5} tone="warn" /></div>, csv: () => "" }, { key: "pending", label: "Pending receipts", align: "right", render: (r) => (r.pending ? <Pill tone="warn">{r.pending}</Pill> : "—") }]} rows={pc.map((r) => ({ ...r, id: r.p }))} />
      </Card>
      <Card title="Site expenses" pad={false}>
        <DataTable dense exportName="expenses" pageSize={8} searchKeys={["id", "desc", "cat"]} filters={[{ key: "cat", label: "Category", options: ["Fuel", "Transport", "Food", "Accommodation", "Petty Cash", "Repair", "Tools", "Site Office", "Electricity", "Security", "Miscellaneous"].filter((c) => EXPENSES.some((e) => e.cat === c)) }, { key: "status", label: "Status", options: ["Pending", "Approved"] }]} columns={[
          { key: "id", label: "Ref", render: (r) => <span className="num font-medium">{r.id}</span> }, { key: "cat", label: "Category" }, { key: "desc", label: "Description" }, ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
          { key: "by", label: "Spent by" }, { key: "date", label: "Date" }, { key: "amt", label: "Amount", align: "right", render: (r) => rs(r.amt) },
          { key: "receipt", label: "Receipt", render: (r) => (r.receipt ? <Paperclip size={14} className="text-good" /> : <span className="flex items-center gap-1 text-[11.5px] text-warn"><Camera size={13} />Upload</span>), csv: (r) => (r.receipt ? "yes" : "no") }, { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
        ]} rows={rows} />
      </Card>
    </div>
  );
}

export function TasksSection({ pid }) {
  const [view, setView] = useState("list");
  const rows = TASKS.filter((t) => !pid || t.p === pid);
  const cols = ["Open", "In Progress", "Done"];
  return (
    <div className="space-y-3">
      <Seg options={[{ key: "list", label: "List" }, { key: "board", label: "Board" }]} value={view} onChange={setView} />
      {view === "list" ? (
        <DataTable dense exportName="tasks" pageSize={10} searchKeys={["title", "owner", "id"]} selectable filters={[{ key: "prio", label: "Priority", options: ["Critical", "High", "Medium", "Low"] }, { key: "status", label: "Status", options: cols }]} columns={[
          { key: "id", label: "ID", render: (r) => <span className="num text-mute">{r.id}</span> }, { key: "title", label: "Task", render: (r) => <span className="font-medium">{r.title}</span> }, ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
          { key: "owner", label: "Owner" }, { key: "due", label: "Due" }, { key: "prio", label: "Priority", render: (r) => <Pill>{r.prio}</Pill>, csv: (r) => r.prio }, { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
        ]} rows={rows} />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">{cols.map((c) => (
          <div key={c} className="rounded-[8px] bg-panel p-2.5"><div className="mb-2 flex items-center justify-between px-1 text-[12px] font-semibold">{c}<span className="num text-faint">{rows.filter((t) => t.status === c).length}</span></div>
            <div className="space-y-2">{rows.filter((t) => t.status === c).map((t) => <div key={t.id} className="lift rounded-[6px] border border-line bg-surface p-3"><div className="flex items-start justify-between gap-2"><span className="text-[13px] font-medium">{t.title}</span><Pill>{t.prio}</Pill></div><div className="mt-1.5 text-[11.5px] text-mute">{projName(t.p)} · {t.owner} · due {t.due}</div></div>)}</div></div>))}</div>
      )}
    </div>
  );
}

export function DocumentsSection({ pid }) {
  const dr = DRAWINGS.filter((d) => !pid || d.p === pid);
  const warn = dr.filter((d) => d.warn);
  return (
    <div className="space-y-4">
      {warn.map((d) => <div key={d.no} className="flex items-start gap-3 rounded-[8px] border border-bad/40 bg-bad-soft p-3.5"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-bad" /><div className="text-[13px]"><b className="text-bad">{d.no} · {projName(d.p)}</b><br />{d.warn} <span className="text-mute">The site team is still referencing the older revision on 2 inspections — notify engineers.</span></div></div>)}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        {FOLDERS.map(([n, c]) => <button key={n} className="lift rounded-[8px] border border-line bg-surface p-3.5 text-left"><FolderOpen size={20} className="text-warn" /><div className="mt-2 text-[13px] font-semibold">{n}</div><div className="num text-[11.5px] text-mute">{c.toLocaleString("en-IN")} files</div></button>)}
      </div>
      <Card title="Drawing register" sub="Only the latest approved revision should be used on site" pad={false}>
        <DataTable dense exportName="drawing-register" pageSize={8} searchKeys={["no", "title"]} filters={[{ key: "status", label: "Status", options: ["Current", "Outdated", "Draft"] }]} columns={[
          { key: "no", label: "Drawing no.", render: (r) => <span className="num font-medium">{r.no}</span> }, { key: "title", label: "Title" }, { key: "rev", label: "Rev", render: (r) => <span className="num font-semibold">{r.rev}</span> },
          ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]), { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
          { key: "issued", label: "Issued" }, { key: "approved", label: "Approved" }, { key: "consultant", label: "Consultant" }, { key: "latest", label: "Latest", render: (r) => <span className="num">{r.latest}</span> },
        ]} rows={dr.map((d) => ({ ...d, id: d.no }))} />
      </Card>
    </div>
  );
}

const IC = { ok: Check, warn: AlertTriangle };
export function ActivitySection({ pid }) {
  const { activity } = useStore();
  const rows = activity.filter((a) => !pid || a.project === pid);
  return (
    <Card title="Activity log" sub="Every major action across the company, with who and when" pad={false}>
      <ol className="divide-y divide-line">
        {rows.map((a, i) => (
          <li key={i} className={cn("flex items-start gap-4 px-4 py-3", a.fresh && "bg-accent-soft/50")}>
            <span className="num w-[72px] shrink-0 pt-0.5 text-[12px] font-medium text-mute">{a.t}</span>
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", a.icon === "warn" ? "bg-bad" : a.icon === "cash" ? "bg-good" : "bg-accent")} />
            <div className="min-w-0 flex-1"><div className="text-[13px]">{a.text}</div><div className="text-[11.5px] text-mute">{a.who}{a.project && ` · ${projName(a.project)}`}</div></div>
          </li>
        ))}
        {rows.length === 0 && <li className="p-8 text-center text-mute">No activity recorded for this project today.</li>}
      </ol>
    </Card>
  );
}
