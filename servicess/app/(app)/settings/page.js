"use client";
import { Fragment } from "react";
import { useState } from "react";
import { Avatar, Chip, PageHead, Panel, Tabs } from "@/components/ui";
import { ROLES, useApp } from "@/lib/store";
import { SLA_MIN } from "@/data/ops";

export default function Settings() {
  const [tab, setTab] = useState("Users & roles");
  const { notify } = useApp();
  return (
    <div className="page">
      <PageHead title="Settings" sub="Users, permissions, SLAs and automation for PrimeCare Service Solutions." />
      <Tabs tabs={["Users & roles", "SLA policy", "Automation"]} value={tab} onChange={setTab} />
      {tab === "Users & roles" && <Panel title="Roles & demo users" tight><table className="tbl"><thead><tr><th>User</th><th>Role</th><th>Access</th><th>Status</th></tr></thead><tbody>{Object.values(ROLES).map((r) => <tr key={r.label}><td><span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Avatar name={r.person} size={24} /><b style={{ fontWeight: 560 }}>{r.person}</b></span></td><td>{r.label}</td><td>{r.nav === "all" ? "Full company visibility" : r.nav.length ? `${r.nav.length} modules` : "Mobile technician app"}</td><td><Chip tone="g" dot>Active</Chip></td></tr>)}</tbody></table></Panel>}
      {tab === "SLA policy" && <Panel title="SLA targets"><dl className="kv">{Object.entries(SLA_MIN).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{k === "AMC" ? "As contracted (default 8h)" : `${v / 60} hours`}</dd></Fragment>)}</dl></Panel>}
      {tab === "Automation" && <Panel title="Automation rules">{["Auto-create AMC preventive visits 7 days before due", "Send WhatsApp updates on assignment, travel and completion", "Escalate when rating ≤ 2★ or repeat issue within 30 days", "Raise purchase order at reorder level", "Flag payment reminders at 7, 15 and 30 days"].map((r) => <label key={r} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--line2)" }}><input type="checkbox" defaultChecked onChange={() => notify("Automation updated")} />{r}</label>)}</Panel>}
    </div>
  );
}
