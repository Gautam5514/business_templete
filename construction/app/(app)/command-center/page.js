"use client";
import Link from "next/link";
import { ArrowRight, Maximize2, Monitor } from "lucide-react";
import { Area, AreaChart, Bar as RBar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AGEING, COMPANY, COMPANY_FLOW, PROJECTS } from "@/data/core";
import SiteMap from "@/components/dashboard/SiteMap";
import { AlertsPanel, CashWaterfall, ProjectCard } from "@/components/dashboard/parts";
import MorningBrief from "@/components/dashboard/MorningBrief";
import { Btn, Card, Counter, Ring, TONES, Tip } from "@/components/ui/ui";
import { ChartTip } from "@/components/ui/charts";

const KPIS = [
  { l: "Active Project Value", v: 86.9, hint: "Total contract value of all 7 running projects." },
  { l: "Work Completed", v: 47.8, s: "55% of contract" },
  { l: "Amount Billed", v: 39.4, s: "₹8.4 Cr unbilled" },
  { l: "Amount Collected", v: 31.8, tone: "good", s: "81% of billed" },
  { l: "Total Spend", v: 42.2 },
  { l: "Receivable", v: 7.6, tone: "warn", s: "pending from clients" },
  { l: "Payable", v: 4.3, tone: "risk", s: "₹1.4 Cr due this week" },
  { l: "Overall Completion", v: 55, suffix: "%", dp: 0, s: "3% behind plan", cur: true },
];

export default function CommandCenter() {
  const counts = [["On Track", 4, "good"], ["Attention", 1, "warn"], ["Cost Risk", 1, "risk"], ["Delayed", 1, "bad"]];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Owner Command Center · Tuesday, 06 October</div>
          <h1 className="display text-[34px] font-semibold leading-[1.05] sm:text-[44px]">Good Afternoon, Arjun</h1>
          <p className="mt-2 max-w-2xl text-[14.5px] text-mute"><b className="text-ink">7 projects. ₹86.9 Cr under execution.</b> Here’s where your attention is needed today.</p>
        </div>
        <div className="flex gap-2"><Link href="/map"><Btn><Maximize2 size={14} /> Full map</Btn></Link><Link href="/wallboard"><Btn variant="primary"><Monitor size={14} /> Control room mode</Btn></Link></div>
      </div>

      {/* company strip */}
      <div className="grid grid-cols-2 overflow-hidden rounded-[8px] border border-line bg-surface sm:grid-cols-4 xl:grid-cols-8">
        {KPIS.map((k, i) => (
          <div key={k.l} className="border-b border-r border-line p-3.5 xl:border-b-0">
            <div className="flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-faint">{k.l}{k.hint && <Tip text={k.hint} />}</div>
            <div className="mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.03em]" style={{ color: k.tone ? TONES[k.tone].var : undefined }}>
              <Counter value={k.v} dp={k.suffix ? 0 : 1} prefix={k.suffix ? "" : "₹"} suffix={k.suffix || ""} />{!k.suffix && <span className="ml-1 text-[12px] font-medium text-mute">Cr</span>}
            </div>
            {k.s && <div className="mt-1 text-[11.5px] text-mute">{k.s}</div>}
          </div>
        ))}
      </div>

      {/* hero */}
      <div className="grid overflow-hidden rounded-[8px] border border-line bg-surface lg:grid-cols-[360px_1fr]">
        <div className="grid-bg border-b border-line p-5 lg:border-b-0 lg:border-r">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Overall Project Portfolio</div>
          <div className="relative mx-auto mt-4 flex h-[236px] w-[236px] items-center justify-center">
            <div className="absolute inset-0"><Ring size={236} stroke={7} segments={[{ value: (4 / 7) * 100, tone: "good" }, { value: (1 / 7) * 100, tone: "warn" }, { value: (1 / 7) * 100, tone: "risk" }, { value: (1 / 7) * 100, tone: "bad" }]}><span /></Ring></div>
            <Ring size={190} stroke={14} value={55} tone="accent">
              <div className="text-center"><div className="num text-[50px] font-semibold leading-none tracking-[-0.04em]"><Counter value={55} suffix="%" /></div><div className="mt-1 text-[10.5px] uppercase tracking-[0.08em] text-faint">Overall completion</div></div>
            </Ring>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-1.5">
            {counts.map(([l, n, t]) => (
              <div key={l} className="rounded-[6px] border border-line bg-surface p-2 text-center"><div className="num text-[20px] font-semibold leading-none" style={{ color: TONES[t].var }}>{n}</div><div className="mt-1 text-[10px] uppercase tracking-[0.04em] text-mute">{l}</div></div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-snug text-mute">Planned progress today is <b className="text-ink">58%</b>. The portfolio is ~3% behind, driven by Riverside and Orion.</p>
        </div>
        <div className="relative min-h-[420px]"><SiteMap height={500} /></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-2.5 flex items-center justify-between"><h2 className="text-[15px] font-semibold">Needs your attention</h2><Link href="/approvals" className="flex items-center gap-1 text-[12px] font-semibold text-accent-ink">7 approvals waiting <ArrowRight size={12} /></Link></div>
          <AlertsPanel />
        </div>
        <MorningBrief />
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between"><h2 className="text-[15px] font-semibold">Portfolio</h2><Link href="/projects" className="flex items-center gap-1 text-[12px] font-semibold text-accent-ink">All projects <ArrowRight size={12} /></Link></div>
        <div className="grid gap-3 2xl:grid-cols-2">{PROJECTS.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card title="Work kiya kitna vs paisa mila kitna" sub="From contract value to cash in the bank — where the money is stuck" action={<Link href="/cash-flow" className="text-[12px] font-semibold text-accent-ink">Open cash flow →</Link>}><CashWaterfall /></Card>
        <div className="space-y-6">
          <Card title="Client receivable ageing" sub="₹7.6 Cr pending — how old is it?">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={AGEING} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide /><YAxis type="category" dataKey="b" width={78} tick={{ fontSize: 11, fill: "var(--mute)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} cursor={{ fill: "var(--panel)" }} />
                <RBar dataKey="v" radius={[0, 2, 2, 0]} barSize={16}>{AGEING.map((_, i) => <Cell key={i} fill={["var(--good)", "var(--warn)", "var(--risk)", "var(--bad)"][i]} />)}</RBar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[12px] text-mute">₹2.1 Cr is over 60 days old. <b className="text-ink">Orion Realty</b> accounts for ₹72.4L of it.</p>
          </Card>
          <Card title="Company cash movement" sub="₹ Cr per month · shaded = forecast">
            <ResponsiveContainer width="100%" height={150}>
              <ComposedChart data={COMPANY_FLOW} margin={{ left: -18, right: 4, top: 6 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--mute)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "var(--mute)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip fmt={(v) => `₹${v} Cr`} />} />
                <RBar dataKey="Inflow" fill="var(--good)" barSize={9} radius={[2, 2, 0, 0]} /><RBar dataKey="Outflow" fill="var(--faint)" barSize={9} radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
