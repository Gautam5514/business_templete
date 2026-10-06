"use client";
import { Check } from "lucide-react";
import { Card, Field, Input, KV, PageHeader, Pill, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useTab } from "@/lib/useTab";
import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/roles";
import { COMPANY, PLANTS, LINES, SHIFTS } from "@/data/masters";

export default function Settings() {
  const [tab, setTab] = useTab(["company", "roles", "plants", "alerts"], "company");
  const { toast } = useStore();
  return (
    <div>
      <PageHeader title="Settings" sub="Company profile, users and roles, plants, shifts and alert rules." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "company", label: "Company" }, { id: "roles", label: "Users & roles" }, { id: "plants", label: "Plants & shifts" }, { id: "alerts", label: "Alert rules" }]} />
      {tab === "company" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Company profile"><div className="grid grid-cols-2 gap-3.5"><KV label="Legal name">{COMPANY.name}</KV><KV label="Head office">{COMPANY.hq}</KV><KV label="Annual turnover">{COMPANY.turnover}</KV><KV label="Operating states">{COMPANY.states.join(", ")}</KV></div><p className="mt-4 text-[12.5px] text-mute">Manufacturer of stainless steel kitchen sinks, sanitary hardware and fabricated metal products.</p></Card>
          <Card title="At a glance"><div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">{COMPANY.stats.map(([k, v]) => <div key={k}><div className="label !text-[10px]">{k}</div><div className="num text-[20px] font-semibold">{v}</div></div>)}</div></Card>
        </div>
      )}
      {tab === "roles" && (
        <DataTable rows={ROLES} rowKey={(r) => r.id} pageSize={15} searchPlaceholder="Search role or person…"
          cols={[{ key: "label", header: "Role", render: (r) => <span className="font-medium">{r.label}</span> }, { key: "person", header: "Demo user" }, { key: "perms", header: "Key permissions", get: (r) => r.perms.join(", "), muted: true }, { key: "m", header: "Modules", align: "right", get: (r) => r.modules.length, render: (r) => `${r.modules.length} of 27` }, { key: "a", header: "Status", render: () => <Pill>Active</Pill> }]} />
      )}
      {tab === "plants" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {PLANTS.map((p) => <Card key={p.id} title={p.name} sub={p.note}><ul className="space-y-1.5 text-[13px]">{LINES.filter((l) => l.plant === p.short).map((l) => <li key={l.id} className="flex justify-between"><span>{l.name} — {l.product}</span><Pill>{l.status}</Pill></li>)}</ul></Card>)}
          <Card title="Shifts" className="lg:col-span-2"><div className="grid gap-3 sm:grid-cols-3">{SHIFTS.map((s) => <div key={s.id} className="rounded-[8px] bg-bg p-3"><div className="text-[13.5px] font-semibold">{s.id}</div><div className="num text-[13px] text-mute">{s.time}</div></div>)}</div></Card>
        </div>
      )}
      {tab === "alerts" && (
        <Card title="Alert rules" sub="Notifications are sent to the owner and the responsible manager" pad={false}>
          <ul className="divide-y divide-line">
            {[["Raw material below minimum stock", "Store · Purchase"], ["Production behind plan by > 4 hours", "Plant Head · Production"], ["Machine breakdown reported", "Maintenance · Plant Head"], ["QC rejection above 3% on a lot", "Quality · Plant Head"], ["Maintenance due (hours or date)", "Maintenance"], ["Purchase order late by > 1 day", "Purchase"], ["Customer over credit limit", "Accounts · Owner"], ["Payment overdue", "Accounts"]].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-3 px-4 py-3"><div><div className="text-[13px] font-medium">{k}</div><div className="text-[12px] text-mute">Notify: {v}</div></div><button onClick={() => toast("Rule saved")} className="flex h-5 w-9 items-center rounded-full bg-ok px-0.5"><span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-white"><Check size={10} className="text-ok" /></span></button></li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
void Field; void Input;
