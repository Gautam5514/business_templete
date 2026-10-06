"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus } from "lucide-react";
import { CLIENTS, PROJECTS } from "@/data/core";
import { ProjectCard } from "@/components/dashboard/parts";
import { DataTable } from "@/components/ui/table";
import { Bar, Btn, PageHead, Pill, Seg, Kpi } from "@/components/ui/ui";
import { cr, fdate } from "@/lib/format";
import { Building2 } from "lucide-react";
import { useStore } from "@/lib/store";

const uniq = (k) => [...new Set(PROJECTS.map((p) => p[k]))];
export default function Projects() {
  const router = useRouter();
  const { setQuick } = useStore();
  const [view, setView] = useState("grid");
  const [f, setF] = useState({});
  const set = (k, v) => setF({ ...f, [k]: v });
  const health = (p) => (p.budget - p.pct > 5 ? "At risk" : p.budget - p.pct > 0 ? "Watch" : "Healthy");
  const rows = useMemo(() => PROJECTS.filter((p) => (!f.status || p.status === f.status) && (!f.pm || p.pm === f.pm) && (!f.city || p.city === f.city) && (!f.type || p.type === f.type) && (!f.client || p.client === f.client) && (!f.comp || (f.comp === "<50%" ? p.pct < 50 : f.comp === "50–80%" ? p.pct >= 50 && p.pct < 80 : p.pct >= 80)) && (!f.health || health(p) === f.health)), [f]);
  const sel = (k, label, opts) => <select value={f[k] || ""} onChange={(e) => set(k, e.target.value)} className="h-8 rounded-[6px] border border-line-strong bg-surface px-2 text-[12.5px] text-mute"><option value="">{label}: All</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
  return (
    <div>
      <PageHead icon={Building2} title="Projects" sub="7 active · 3 upcoming · ₹86.9 Cr under execution across Jharkhand, Bihar and West Bengal." actions={<><Seg options={[{ key: "grid", label: "Grid", icon: LayoutGrid }, { key: "table", label: "Table", icon: List }]} value={view} onChange={setView} /><Btn variant="primary" onClick={() => setQuick("menu")}><Plus size={14} /> New project</Btn></>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {sel("status", "Status", uniq("status"))}{sel("pm", "Project manager", uniq("pm"))}{sel("city", "City", uniq("city"))}{sel("type", "Type", uniq("type"))}{sel("client", "Client", CLIENTS)}{sel("comp", "Completion", ["<50%", "50–80%", "80%+"])}{sel("health", "Budget health", ["Healthy", "Watch", "At risk"])}
        {Object.values(f).some(Boolean) && <Btn variant="ghost" size="md" onClick={() => setF({})}>Clear filters</Btn>}
        <span className="ml-auto self-center text-[12px] text-mute">{rows.length} of 7 projects</span>
      </div>
      {view === "grid" ? (
        <div className="grid gap-3 xl:grid-cols-2">{rows.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      ) : (
        <DataTable exportName="projects" pageSize={10} searchKeys={["name", "client", "city", "pm"]} onRowClick={(r) => router.push(`/projects/${r.id}`)} selectable columns={[
          { key: "name", label: "Project", render: (r) => <div><div className="font-semibold">{r.name}</div><div className="text-[11.5px] text-mute">{r.type}</div></div> },
          { key: "client", label: "Client", render: (r) => <span className="text-mute">{r.client}</span> }, { key: "city", label: "Location", render: (r) => `${r.city}, ${r.state.split(" ")[0]}`, csv: (r) => r.city },
          { key: "value", label: "Value", align: "right", render: (r) => cr(r.value) },
          { key: "pct", label: "Completion", render: (r) => <div className="flex w-28 items-center gap-2"><Bar value={r.pct} tone={r.mapTone === "info" ? "good" : r.mapTone} h={5} marker={r.planned} /><span className="num text-[12px] font-semibold">{r.pct}%</span></div>, csv: (r) => r.pct + "%" },
          { key: "end", label: "Planned end", render: (r) => fdate(r.end, true) }, { key: "budget", label: "Budget used", align: "right", render: (r) => <span className={r.budget - r.pct > 5 ? "font-semibold text-risk" : ""}>{r.budget}%</span> },
          { key: "billed", label: "Billed", align: "right", render: (r) => cr(r.billed) }, { key: "collected", label: "Collected", align: "right", render: (r) => cr(r.collected) },
          { key: "margin", label: "Margin", align: "right", render: (r) => <span className={r.margin < 10 ? "font-semibold text-risk" : "text-good"}>{r.margin}%</span> }, { key: "pm", label: "PM" },
          { key: "status", label: "Status", render: (r) => <Pill tone={r.mapTone === "info" ? "good" : r.mapTone}>{r.status}</Pill>, csv: (r) => r.status },
        ]} rows={rows} />
      )}
    </div>
  );
}
