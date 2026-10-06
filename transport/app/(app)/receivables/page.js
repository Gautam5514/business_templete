"use client";
import { Phone, Mail, MessageCircle, Handshake, Scale, ArrowUpCircle } from "lucide-react";
import { Chip, Insight, Kpis, PageHead, Panel } from "@/components/ui";
import { Bars } from "@/components/charts";
import { AGING, FOLLOWUPS, RECEIVABLE } from "@/data/ops";
import { inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const ICON = { Call: Phone, WhatsApp: MessageCircle, Email: Mail, "Promise to Pay": Handshake, Dispute: Scale, Escalation: ArrowUpCircle };
export default function Receivables() {
  const { notify } = useApp();
  const total = AGING.reduce((a, b) => a + b.v, 0);
  return (
    <div className="page">
      <PageHead title="Receivables" sub="Who owes you what, for how long — and who is chasing it." />
      <Insight tone="r"><b>{inr(RECEIVABLE.overdue)} is overdue</b> out of {inr(RECEIVABLE.total)} receivable. Every 10 days of delay on this balance costs ≈ ₹1.1L in financing — collect from the three customers below first.</Insight>
      <Kpis items={[{ label: "Total receivable", value: inr(RECEIVABLE.total) }, { label: "Overdue", value: inr(RECEIVABLE.overdue), tone: "r", hint: "38% of receivable" }, { label: "Collected (MTD)", value: "₹2.34 Cr", tone: "g" }, { label: "Billed vs collected", value: "₹2.92 Cr / ₹2.34 Cr" }, { label: "DSO", value: "29 days" }]} />
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", alignItems: "start" }}>
        <Panel title="Ageing buckets" sub="₹ Lakh">
          <Bars data={AGING.map((a, i) => ({ k: a.k + (i ? " d" : ""), v: +(a.v / 1e5).toFixed(1), color: i === 0 ? "grey" : i < 3 ? "amber" : "red" }))} fmt={(v) => v + "L"} height={200} />
          <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginTop: 14 }}>{AGING.map((a, i) => <i key={i} title={a.k} style={{ width: `${(a.v / total) * 100}%`, background: ["var(--grey)", "var(--amber)", "var(--amber)", "var(--red)", "var(--red)", "var(--ink)"][i], opacity: 0.5 + i * 0.1 }} />)}</div>
        </Panel>
        <Panel title="Collection follow-up" sub="call · WhatsApp · email · promise · dispute · escalation" tight>
          {FOLLOWUPS.map((f) => { const I = ICON[f.kind]; return (
            <div key={f.customer} className="feed-i" style={{ alignItems: "center" }}>
              <span className="iconbtn" style={{ flex: "none" }}><I size={15} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><b>{f.customer}</b><div className="muted" style={{ fontSize: 12.5 }}>{f.note}</div><div className="faint" style={{ fontSize: 11.5 }}>{f.owner} · {f.overdue} days overdue</div></div>
              <div style={{ textAlign: "right" }}><b>{inr(f.amount)}</b><div><Chip tone={f.tone}>{f.kind}</Chip></div></div>
              <button className="btn sm" onClick={() => notify(`Reminder sent to ${f.customer}`)}>Nudge</button>
            </div>); })}
        </Panel>
      </div>
    </div>
  );
}
