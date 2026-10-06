"use client";
import { Settings } from "lucide-react";
import { Avatar, Btn, Card, Kv, PageHead, Pill } from "@/components/ui/ui";
import { ROLES } from "@/lib/roles";
import { COMPANY } from "@/data/core";
import { useStore } from "@/lib/store";

const PERMS = ["View", "Create", "Approve", "Pay"];
export default function SettingsPage() {
  const { theme, setTheme, role, setRole } = useStore();
  return (
    <div className="space-y-5">
      <PageHead icon={Settings} title="Settings" sub="Company profile, users and role permissions." />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card title="Company"><Kv k="Name" v={COMPANY.name} /><Kv k="Head office" v={COMPANY.hq} /><Kv k="Annual turnover" v="₹42 Cr" /><Kv k="Active / upcoming projects" v="7 / 3" /><Kv k="Employees · Subcontractors · Suppliers" v="286 · 64 · 118" /><Kv k="Operations" v="Jharkhand, Bihar, West Bengal" /></Card>
        <Card title="Appearance"><div className="flex gap-2">{["light", "dark"].map((t) => <button key={t} onClick={() => setTheme(t)} className={`flex-1 rounded-[8px] border p-4 text-left ${theme === t ? "border-accent ring-2 ring-accent/20" : "border-line"}`}><div className="text-[13px] font-semibold capitalize">{t}</div><div className="text-[12px] text-mute">{t === "dark" ? "Control-room look for Command Center, Live Sites and Wallboard." : "Clean, high-contrast office view."}</div></button>)}</div></Card>
      </div>
      <Card title="Roles & permissions" sub="13 roles — click Preview to see exactly what each role sees" pad={false}>
        <table className="w-full text-left"><thead className="bg-panel text-[10.5px] font-semibold uppercase tracking-wider text-faint"><tr><th className="px-4 py-2">Role</th><th className="px-4 py-2">Demo user</th><th className="px-4 py-2">Modules</th><th className="px-4 py-2">Access</th><th /></tr></thead>
          <tbody>{ROLES.map((r) => <tr key={r.key} className="border-t border-line hover:bg-panel"><td className="px-4 py-2.5 font-medium">{r.label}</td><td className="px-4 py-2.5"><span className="flex items-center gap-2"><Avatar name={r.person} size={22} />{r.person}</span></td><td className="px-4 py-2.5 text-mute">{r.all ? "All modules" : `${r.allow.length} modules`}</td><td className="px-4 py-2.5"><div className="flex gap-1">{PERMS.map((p, i) => <Pill key={p} tone={r.all || i < (r.key === "accounts" || r.key === "purchase" || r.key === "qs" ? 3 : 2) ? "good" : "mute"} dot={false}>{p}</Pill>)}</div></td><td className="px-4 py-2.5 text-right"><Btn size="sm" variant={role.key === r.key ? "primary" : "default"} onClick={() => setRole(r.key)}>{role.key === r.key ? "Viewing" : "Preview"}</Btn></td></tr>)}</tbody></table>
      </Card>
    </div>
  );
}
