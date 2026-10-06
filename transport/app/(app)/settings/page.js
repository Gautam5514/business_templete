"use client";
import { Check, Minus } from "lucide-react";
import { Avatar, Chip, PageHead, Panel } from "@/components/ui";
import { ROLES, useApp } from "@/lib/store";

const MODULES = ["Command Center", "Live Fleet", "Trips", "Dispatch", "Vehicles", "Drivers", "Fuel", "Expenses", "Maintenance", "POD", "Invoices", "Receivables", "Reports", "Settings"];
const ACCESS = { owner: "all", ops: [0, 1, 2, 3, 4, 5, 9, 12], fleet: [0, 1, 4, 5, 6, 8, 12], dispatch: [0, 1, 2, 3, 4, 5], hub: [1, 2, 4, 5, 9], drivermgr: [5, 2, 7], accounts: [7, 9, 10, 11, 12, 6], maint: [8, 4, 12], crm: [2, 10, 11, 12], driver: [], admin: [13] };
export default function Settings() {
  const { role, setRole } = useApp();
  return (
    <div className="page">
      <PageHead title="Settings" sub="Roles, permissions and company configuration." />
      <div className="grid" style={{ gridTemplateColumns: "300px minmax(0,1fr)", alignItems: "start" }}>
        <Panel title="Company"><dl className="kv"><dt>Name</dt><dd>Eastern Freight &amp; Logistics</dd><dt>Head office</dt><dd>Ranchi</dd><dt>Turnover</dt><dd>₹34.8 Cr</dd><dt>Fleet</dt><dd>86 owned · 42 attached</dd><dt>Hubs</dt><dd>14</dd><dt>Trips / month</dt><dd>1,840</dd></dl><div className="hr" /><div className="lbl">States</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>{["Jharkhand", "Bihar", "West Bengal", "Odisha", "Uttar Pradesh", "Delhi NCR"].map((s) => <Chip key={s}>{s}</Chip>)}</div></Panel>
        <Panel title="Role-based access" sub="switch role to preview the experience" tight>
          <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Role</th>{MODULES.map((m) => <th key={m} style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: 110 }}>{m}</th>)}<th /></tr></thead><tbody>
            {Object.entries(ROLES).map(([k, r]) => <tr key={k} style={role === k ? { background: "var(--accent-soft)" } : null}><td style={{ display: "flex", gap: 8, alignItems: "center" }}><Avatar name={r.person} size={22} /><div><b>{r.label}</b><div className="faint" style={{ fontSize: 11 }}>{r.person}</div></div></td>
              {MODULES.map((m, i) => <td key={m} style={{ textAlign: "center" }}>{ACCESS[k] === "all" || ACCESS[k].includes(i) ? <Check size={14} className="pos" /> : <Minus size={12} className="faint" />}</td>)}
              <td><button className="btn sm" onClick={() => setRole(k)}>{role === k ? "Active" : "View as"}</button></td></tr>)}
          </tbody></table></div>
        </Panel>
      </div>
    </div>
  );
}
