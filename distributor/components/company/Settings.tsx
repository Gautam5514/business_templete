"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Field, Input, PageHeader, Select, Tabs } from "@/components/ui/ui";
import { ROLES, ROLE_PERMS } from "@/lib/roles";

const MODS = ["dashboard", "orders", "customers", "products", "inventory", "warehouses", "purchase", "dispatch", "shipments", "invoices", "payments", "receivables", "returns", "expenses", "employees", "reports", "logs", "settings"];
export function Settings() {
  const { toast, ownerMode, setOwnerMode } = useStore();
  const [tab, setTab] = useState<"Company" | "Roles & Permissions" | "Preferences">("Company");
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" sub="Company profile, roles and configuration." actions={<Btn variant="primary" onClick={() => toast("Settings saved", "ok")}>Save changes</Btn>} />
      <Tabs tabs={["Company", "Roles & Permissions", "Preferences"] as const} value={tab} onChange={setTab} />
      {tab === "Company" && (
        <Card title="Company profile"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Legal name"><Input defaultValue="BharatFlow Distribution Pvt. Ltd." /></Field><Field label="Head office"><Input defaultValue="Ranchi, Jharkhand" /></Field><Field label="GSTIN"><Input defaultValue="20AABCB4421K1Z5" /></Field>
          <Field label="Business"><Input defaultValue="Electrical, sanitaryware, hardware & building-material distribution" /></Field><Field label="Financial year"><Select defaultValue="2026-27"><option>2026-27</option><option>2025-26</option></Select></Field><Field label="Currency"><Input defaultValue="INR (₹) · Lakh / Crore format" /></Field>
        </div></Card>
      )}
      {tab === "Roles & Permissions" && (
        <Card title="Role access matrix" sub="Switch role from the profile menu to experience each view" pad={false}>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">Module</th>{ROLES.map((r) => <th key={r.id} className="px-2 text-center font-medium">{r.label}</th>)}</tr></thead>
            <tbody>{MODS.map((m) => <tr key={m} className="border-b border-line"><td className="px-4 py-2 capitalize">{m}</td>{ROLES.map((r) => <td key={r.id} className="text-center">{r.modules.includes(m) ? <Check size={15} className="mx-auto text-ok" /> : <span className="text-line-strong">—</span>}</td>)}</tr>)}</tbody></table></div>
          <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 lg:grid-cols-4">{ROLES.map((r) => <div key={r.id} className="text-[12.5px]"><div className="font-medium">{r.label}</div><div className="text-mute">{ROLE_PERMS[r.id].join(" · ")}</div></div>)}</div>
        </Card>
      )}
      {tab === "Preferences" && (
        <Card title="Preferences"><div className="space-y-3 text-[13px]">
          <label className="flex items-center justify-between"><span>Owner View<span className="block text-[12px] text-mute">Simplify navigation to what an owner needs.</span></span><input type="checkbox" checked={ownerMode} onChange={(e) => setOwnerMode(e.target.checked)} className="accent-[var(--accent)]" /></label>
          <label className="flex items-center justify-between"><span>Daily 9 AM business summary on WhatsApp<span className="block text-[12px] text-mute">Sales, collections, dispatches and alerts.</span></span><input type="checkbox" defaultChecked className="accent-[var(--accent)]" /></label>
          <label className="flex items-center justify-between"><span>Credit-limit override requires Owner approval</span><input type="checkbox" defaultChecked className="accent-[var(--accent)]" /></label>
        </div></Card>
      )}
    </div>
  );
}
