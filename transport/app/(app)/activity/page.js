"use client";
import { useState } from "react";
import { AlertFeed } from "@/components/blocks";
import { Chip, PageHead, Panel, Seg } from "@/components/ui";
import { ACTIVITY } from "@/data/ops";

const tone = { alert: "r", money: "g", pod: "a", fuel: "b", dispatch: "b", hub: "n", maint: "a", rate: "n" };
export default function Activity() {
  const [f, setF] = useState("All");
  const rows = ACTIVITY.filter((a) => f === "All" || (f === "Alerts" ? a.kind === "alert" : f === "Money" ? a.kind === "money" : a.kind === "dispatch" || a.kind === "hub"));
  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <PageHead title="Activity" sub="A live audit trail of every action — who did what, when, on which trip."><Seg options={["All", "Alerts", "Money", "Operations"]} value={f} onChange={setF} /></PageHead>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 420px", alignItems: "start" }}>
        <Panel title="Activity stream" tight>
          {rows.map((a, i) => <div key={i} className="feed-i"><i className={"dot " + tone[a.kind]} style={{ marginTop: 6 }} /><div style={{ flex: 1 }}><b>{a.who}</b> {a.what}<div className="muted" style={{ fontSize: 12.5 }}>{a.detail}</div></div><span className="faint">{a.when}</span></div>)}
        </Panel>
        <Panel title="Open alerts" tight><AlertFeed compact limit={6} /></Panel>
      </div>
    </div>
  );
}
