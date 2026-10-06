import Link from "next/link";
import { ArrowRight } from "lucide-react";

const POINTS = ["Know what you need to produce", "Know what material you need", "Know what was consumed", "Know what was produced", "Know what was rejected", "Know why production stopped", "Know what it cost", "Know what is ready", "Know what was dispatched", "Know what money is still pending"];

export default function Login() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden flex-col justify-between bg-[#15191d] p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 26 26"><rect width="26" height="26" rx="5" fill="#fff" /><path d="M5 19V9l5 3V9l5 3V6h3v13z" fill="#15191d" /><rect x="5" y="20.2" width="16" height="1.4" fill="#5b7186" /></svg>
          <span className="text-[17px] font-semibold tracking-[-0.01em]">FactoryFlow</span>
        </div>
        <div>
          <h1 className="max-w-[520px] text-[40px] font-semibold leading-[1.08] tracking-[-0.025em]">From raw material to finished goods — track everything.</h1>
          <ul className="mt-8 grid max-w-[520px] grid-cols-1 gap-x-8 gap-y-2.5 text-[14px] text-white/70 sm:grid-cols-2">
            {POINTS.map((p) => <li key={p} className="flex items-start gap-2"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#8fa3b5]" />{p}</li>)}
          </ul>
        </div>
        <div className="text-[12.5px] text-white/45">Demo company: Bharat MetalWorks Pvt. Ltd. · Ranchi &amp; Ramgarh · 2 plants · 4 lines · ₹26.8 Cr turnover</div>
      </div>
      <div className="flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-[380px]">
          <h2 className="text-[22px] font-semibold tracking-[-0.015em]">Sign in</h2>
          <p className="mt-1 text-[13px] text-mute">Demo environment — no password needed.</p>
          <div className="mt-6 space-y-3">
            <div><div className="mb-1 text-[12px] font-medium text-mute">Work email</div><div className="h-9 rounded-[6px] border border-line-strong bg-surface px-3 text-[13.5px] leading-9">rakesh@bharatmetalworks.demo</div></div>
            <div><div className="mb-1 text-[12px] font-medium text-mute">Password</div><div className="h-9 rounded-[6px] border border-line-strong bg-surface px-3 text-[13.5px] leading-9 tracking-widest">••••••••••</div></div>
          </div>
          <Link href="/dashboard" className="mt-5 flex h-10 items-center justify-between rounded-[6px] bg-accent px-4 text-[13.5px] font-medium text-white hover:bg-accent-ink">
            <span>Continue as Rakesh Agarwal<span className="ml-1.5 text-white/60">· Managing Director</span></span><ArrowRight size={16} />
          </Link>
          <p className="mt-4 text-[12px] text-faint">Switch to Plant Head, Store, Quality, Maintenance or any other role from the profile menu inside the app.</p>
        </div>
      </div>
    </div>
  );
}
