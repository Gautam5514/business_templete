"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { Btn, Field, Input } from "@/components/ui/ui";

const PROMISE = ["what was ordered", "what was available", "what was sent", "what reached", "what was billed", "what was collected", "what is still pending"];
const STAGES = [["New", "₹18.4L"], ["Approved", "₹14.2L"], ["Packing", "₹8.7L"], ["In Transit", "₹28.4L"], ["Delivered", "₹34.8L"], ["Payment Pending", "₹18.6L"]];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("raj@bharatflow.demo");
  const [pw, setPw] = useState("demo123");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const enter = () => { setBusy(true); setTimeout(() => router.push("/dashboard"), 550); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== "raj@bharatflow.demo" || pw !== "demo123") { setErr("Email or password is incorrect. Use the demo credentials shown below."); return; }
    setErr(""); enter();
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.08fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#161614] p-10 text-white lg:flex xl:p-14">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 26 26"><rect width="26" height="26" rx="6" fill="#fff" /><path d="M7 8.5 13 5l6 3.5v7L13 19l-6-3.5z" fill="none" stroke="#161614" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 8.5 13 12l6-3.5M13 12v7" stroke="#3a3fc4" strokeWidth="1.5" strokeLinejoin="round" fill="none" /></svg>
          <span className="text-[15px] font-semibold tracking-tight">Distribution Control OS</span>
        </div>
        <div className="relative max-w-[560px]">
          <h2 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.025em] xl:text-[40px]">Know what was ordered, sent, billed and collected — without calling anyone.</h2>
          <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[13.5px] text-white/75">
            {PROMISE.map((p) => <li key={p} className="flex items-center gap-2"><Check size={14} className="text-[#8d92f5]" />Know {p}</li>)}
          </ul>
          <div className="mt-9 rounded-[10px] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-white/50"><span>Order pipeline · live</span><span className="flex items-center gap-1.5"><span className="live-dot h-1.5 w-1.5 rounded-full bg-[#4ade80]" />BharatFlow Distribution</span></div>
            <div className="grid grid-cols-6 gap-2">
              {STAGES.map(([l, v], i) => (
                <div key={l} className="rounded-[6px] bg-white/[0.06] p-2.5">
                  <div className="text-[10.5px] text-white/55">{l}</div>
                  <div className="num mt-1 text-[14px] font-semibold">{v}</div>
                  <div className="mt-2 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#8d92f5]" style={{ width: `${[45, 70, 38, 92, 100, 52][i]}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative text-[12px] text-white/45">Demo environment · All business data is fictional</div>
      </section>

      <section className="flex flex-col justify-center bg-surface px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <svg width="28" height="28" viewBox="0 0 26 26"><rect width="26" height="26" rx="6" fill="#1b1b19" /><path d="M7 8.5 13 5l6 3.5v7L13 19l-6-3.5z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 8.5 13 12l6-3.5M13 12v7" stroke="#8d92f5" strokeWidth="1.5" strokeLinejoin="round" fill="none" /></svg>
            <span className="text-[15px] font-semibold">Distribution Control OS</span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Sign in</h1>
          <p className="mt-1.5 text-[14px] text-mute">Your entire distribution business. One system.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Work email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className="!h-10" /></Field>
            <Field label="Password">
              <div className="relative">
                <Input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" className="!h-10 pr-9" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink" aria-label="Toggle password">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </Field>
            {err && <div className="rounded-[6px] bg-bad-soft px-3 py-2 text-[12.5px] text-bad">{err}</div>}
            <button type="submit" disabled={busy} className="flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-ink text-[14px] font-medium text-white hover:bg-black disabled:opacity-60">{busy ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}</button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[12px] text-faint"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
          <Btn variant="primary" className="!h-10 w-full !text-[14px]" onClick={enter} icon={<ArrowRight size={16} className="order-last" />}>Explore Demo</Btn>

          <div className="mt-7 rounded-[8px] border border-line bg-bg p-3.5 text-[12.5px] text-mute">
            <div className="label mb-1.5">Demo credentials</div>
            <div className="flex justify-between"><span>Email</span><span className="num font-medium text-ink">raj@bharatflow.demo</span></div>
            <div className="mt-1 flex justify-between"><span>Password</span><span className="num font-medium text-ink">demo123</span></div>
            <div className="mt-1 flex justify-between"><span>Signs in as</span><span className="font-medium text-ink">Rajesh Agarwal — Managing Director</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
