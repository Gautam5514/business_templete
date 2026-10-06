"use client";
import Link from "next/link";
import { useState } from "react";
import { Card, Kpi, PageHeader, Pill, Progress, Segmented } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { MACHINES } from "@/data/masters";
import { hm, num } from "@/lib/format";
import { useRouter } from "next/navigation";
import { MachineLink, WoLink } from "@/components/ui/links";

const dot = { Running: "bg-ok", Idle: "bg-faint", Paused: "bg-warn", Maintenance: "bg-warn", Breakdown: "bg-bad" };

export default function Machines() {
  const [view, setView] = useState("Cards");
  const [plant, setPlant] = useState("All");
  const router = useRouter();
  const rows = MACHINES.filter((m) => plant === "All" || m.plant === plant);
  const c = (s) => MACHINES.filter((m) => m.status === s).length;
  return (
    <div>
      <PageHeader title="Machines" sub="Every press, welder, polisher and CNC — status, output, runtime and service due." actions={<><Segmented options={["All", "Ranchi", "Ramgarh"]} value={plant} onChange={setPlant} /><Segmented options={["Cards", "Table"]} value={view} onChange={setView} /></>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Running" value={c("Running")} /><Kpi label="Idle / paused" value={c("Idle") + c("Paused")} /><Kpi label="Maintenance" value={c("Maintenance")} tone="warn" /><Kpi label="Utilization" value="82%" /><Kpi label="Service due today" value="1" tone="bad" sub="HP-03 · 482 h" />
      </div>
      {view === "Cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((m) => (
            <Link key={m.id} href={`/machines/${m.id}`} className="block rounded-[8px] border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-bg">
              <div className="flex items-start justify-between gap-2"><div><div className="text-[14px] font-semibold">{m.name}</div><div className="text-[12px] text-mute">{m.plant} · {m.line}</div></div><span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${dot[m.status]} ${m.status === "Running" ? "live-dot" : ""}`} /><Pill>{m.status}</Pill></span></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12.5px]">
                <div><div className="label !text-[10px]">Output today</div><div className="num font-semibold">{num(m.out)}</div></div>
                <div><div className="label !text-[10px]">Runtime</div><div className="num font-semibold">{hm(m.runMin)}</div></div>
                <div><div className="label !text-[10px]">Efficiency</div><div className={`num font-semibold ${m.eff && m.eff < 80 ? "text-warn" : ""}`}>{m.eff}%</div></div>
              </div>
              <Progress value={m.eff} tone={m.eff >= 85 ? "ok" : m.eff >= 70 ? "accent" : "warn"} className="mt-2.5" />
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-line pt-3 text-[12px]">
                <div><span className="text-mute">Work order </span>{m.wo}</div><div><span className="text-mute">Operator </span>{m.operator}</div>
                <div><span className="text-mute">Last service </span>{m.lastM}</div><div><span className="text-mute">Next service </span><span className={m.nextM === "08 Oct" || m.nextM === "06 Oct" ? "font-medium text-warn" : ""}>{m.nextM}</span></div>
                <div className="col-span-2"><span className="text-mute">Downtime today </span><span className={m.downMin > 100 ? "font-medium text-bad" : ""}>{m.downMin} min</span></div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <DataTable rows={rows} rowKey={(m) => m.id} pageSize={25} exportName="machines" searchPlaceholder="Search machine…" onRowClick={(m) => router.push(`/machines/${m.id}`)}
          filters={[{ key: "st", label: "Status", options: ["Running", "Idle", "Paused", "Maintenance"], match: (r, v) => r.status === v }]}
          cols={[{ key: "id", header: "Machine", render: (m) => <MachineLink id={m.id} /> }, { key: "type", header: "Type", muted: true }, { key: "plant", header: "Plant" }, { key: "status", header: "Status", render: (m) => <Pill>{m.status}</Pill> }, { key: "wo", header: "Work order", render: (m) => <WoLink id={m.wo} /> }, { key: "runMin", header: "Runtime", align: "right", render: (m) => hm(m.runMin) }, { key: "out", header: "Output", align: "right", render: (m) => num(m.out) }, { key: "eff", header: "Efficiency", align: "right", render: (m) => `${m.eff}%` }, { key: "lastM", header: "Last service" }, { key: "nextM", header: "Next service" }, { key: "downMin", header: "Downtime", align: "right", render: (m) => `${m.downMin} min` }, { key: "operator", header: "Operator", muted: true }]} />
      )}
    </div>
  );
}
void Card;
