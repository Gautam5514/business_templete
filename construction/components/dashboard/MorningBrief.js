"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Coins, HardHat, ShieldAlert, Sun } from "lucide-react";
import { Btn, Drawer, Pill } from "@/components/ui/ui";
import { useStore } from "@/lib/store";

const Sec = ({ icon: I, title, children }) => (
  <div className="border-b border-line py-3 last:border-0">
    <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-faint"><I size={13} />{title}</div>
    <div className="space-y-1 text-[13px]">{children}</div>
  </div>
);
export default function MorningBrief({ compact }) {
  const [open, setOpen] = useState(false);
  const { approvals } = useStore();
  const pend = approvals.filter((a) => a.state === "pending").length;
  return (
    <>
      <div className="rounded-[8px] border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div><div className="flex items-center gap-1.5 text-[13px] font-semibold"><Sun size={14} className="text-brand" /> Your Morning Brief</div><div className="text-[11.5px] text-mute">Tuesday, 06 October · AI-generated 7:00 AM</div></div>
        </div>
        <div className="px-4 pb-3 pt-1">
          <Sec icon={CalendarCheck2} title="Company"><p><b>7</b> active projects · <b className="text-good">4</b> on track · <b className="text-warn">2</b> need attention · <b className="text-bad">1</b> delayed</p></Sec>
          <Sec icon={Coins} title="Money"><p><b>₹28L</b> expected collection today</p><p><b>₹14L</b> vendor payment due</p></Sec>
          <Sec icon={HardHat} title="Sites"><p>Skyline slab pour scheduled</p><p>Orion steel shortage</p><p>Riverside is <b className="text-bad">11 days</b> delayed</p></Sec>
          <Sec icon={ShieldAlert} title="Approval & risk"><p><b>{pend}</b> approvals waiting</p><p>Metro Mall budget overrun risk increased</p></Sec>
          <Btn variant="primary" className="mt-2 w-full" onClick={() => setOpen(true)}>Open Full Brief <ArrowRight size={14} /></Btn>
        </div>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Morning Brief — Tuesday, 06 October" sub="Prepared for Arjun Mehta · Vertex Buildcon" width={560}>
        <div className="space-y-5 text-[13px] leading-relaxed">
          <p className="text-[14px]">You have <b>7 active projects worth ₹86.9 Cr</b>, 55% complete overall. Cash is healthy at the company level, but two clients need a push and one site is at risk of stopping tomorrow.</p>
          {[
            ["Do first", "bad", [["Riverside Villas — 11 days late", "Steel PO-1802 slipped again. Crane CR-01 is down. Decide: expedite from Tata Steel Partner (+₹32K freight) to recover 5 days.", "/projects/riverside"], ["Skyline TMT 12mm — approve MR-2841 / PO-1844", "Stock lasts 1.1 days. JSW is ₹18,600 dearer but 3 days faster — avoids ~₹1.2L delay cost.", "/approvals"]]],
            ["Collect", "warn", [["Orion Realty — ₹72.4L (18 days)", "RA Bill #08 certified ₹76.4L; only ₹4L received. Their finance head promised an update by today.", "/billing"], ["₹28L expected today", "Ranchi Industrial Corporation RTGS against RA #08.", "/payments"]]],
            ["Watch", "risk", [["Metro Mall — budget 89% vs 83% work", "Projected overrun ₹11.4L. CO-044 (₹8.4L) still unapproved by the client.", "/projects/metro?tab=budget"], ["Quality: Orion basement waterproofing failed", "Re-inspection scheduled tomorrow 10 AM.", "/quality"]]],
          ].map(([h, t, items]) => (
            <div key={h}><div className="mb-2 flex items-center gap-2"><Pill tone={t}>{h}</Pill></div>
              <div className="space-y-2">{items.map(([a, b, href]) => <Link key={a} href={href} onClick={() => setOpen(false)} className="block rounded-[6px] border border-line p-3 hover:bg-panel"><div className="font-semibold">{a}</div><div className="text-mute">{b}</div></Link>)}</div></div>
          ))}
          <div className="rounded-[6px] bg-panel p-3 text-mute">Weather: rain forecast for Kolkata (Metro Mall) after 4 PM; clear in Ranchi and Jamshedpur. Skyline Tower A slab pour is cleared to proceed.</div>
        </div>
      </Drawer>
    </>
  );
}
