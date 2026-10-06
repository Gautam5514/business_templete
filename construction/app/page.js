"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from "lucide-react";
import SiteArt from "@/components/site/SiteArt";
import { Logo } from "@/components/shell/AppShell";

const USER = "arjun.mehta@vertexbuildcon.in", PASS = "SiteControl@2026";

function useTyped(text, delay, speed = 38) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0, iv;
    const t = setTimeout(() => { iv = setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(iv); }, speed); }, delay);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [text, delay, speed]);
  return [text.slice(0, n), n >= text.length];
}

export default function Login() {
  const router = useRouter();
  const [u, uDone] = useTyped(USER, 500), [p, pDone] = useTyped(PASS, 500 + USER.length * 38 + 250, 55);
  const [show, setShow] = useState(false), [busy, setBusy] = useState(false);
  const go = (e) => { e?.preventDefault(); setBusy(true); setTimeout(() => router.push("/command-center"), 700); };
  const field = "flex h-11 items-center gap-2.5 rounded-[8px] border border-[#2b343b] bg-[#0f1316] px-3.5 text-[14px] text-white focus-within:border-[#f5b301]";
  return (
    <div data-theme="dark" className="grid min-h-screen bg-[#07090b] text-white lg:grid-cols-[1.15fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0"><SiteArt kind="tower" progress={72} seed={1} tone="night" className="h-full w-full" /></div>
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090b] via-[#07090b]/85 to-[#07090b]/20" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-4"><Logo dark /><span className="hazard h-3.5 w-14" /></div>
          <div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="display max-w-xl text-[52px] font-semibold leading-[1.02]">Every site.<br />Every rupee.<br /><span className="text-[#f5b301]">Every milestone.</span><br />Under control.</motion.h1>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[["7", "active projects"], ["₹86.9 Cr", "under execution"], ["606", "workers on site today"]].map(([v, l], i) => (
                <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.12 }} className="glass rounded-[8px] border-white/10 !bg-white/[0.04] px-4 py-3"><div className="num text-[24px] font-semibold leading-none">{v}</div><div className="mt-1 text-[11.5px] text-[#98a3ad]">{l}</div></motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center p-6">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <motion.form onSubmit={go} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-[400px]">
          <div className="mb-8 lg:hidden"><Logo dark /></div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f5b301]"><ShieldCheck size={13} /> Secure sign-in</div>
          <h2 className="display text-[34px] font-semibold leading-tight">Welcome back</h2>
          <p className="mt-1 text-[13.5px] text-[#98a3ad]">Vertex Buildcon Pvt. Ltd. · Demo environment</p>
          <div className="mt-7 space-y-4">
            <label className="block"><span className="mb-1.5 block text-[12px] font-medium text-[#98a3ad]">Username</span>
              <div className={field}><User size={16} className="text-[#66727d]" /><span className={`flex-1 truncate ${uDone ? "" : "caret"}`}>{u}</span></div></label>
            <label className="block"><span className="mb-1.5 block text-[12px] font-medium text-[#98a3ad]">Password</span>
              <div className={field}><Lock size={16} className="text-[#66727d]" /><span className={`flex-1 truncate ${uDone && !pDone ? "caret" : ""} ${show ? "" : "tracking-[0.2em]"}`}>{show ? p : "•".repeat(p.length)}</span>
                <button type="button" onClick={() => setShow(!show)} className="text-[#66727d] hover:text-white">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-[#66727d]"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#f5b301]" /> Keep me signed in</label><span>Forgot password?</span></div>
          <button disabled={busy} className="mt-6 flex h-12 w-full items-center justify-between rounded-[8px] bg-[#f5b301] px-5 text-[14px] font-semibold text-black transition hover:brightness-110 disabled:opacity-80">
            <span>{busy ? "Opening command center…" : <>Sign in as Arjun Mehta<span className="ml-1.5 font-normal text-black/60">· Managing Director</span></>}</span>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
          <p className="mt-5 text-[12px] leading-relaxed text-[#66727d]">Credentials are pre-filled for the demo. Switch to Project Manager, Site Engineer, QS, Store or any other role from the profile menu inside the app.</p>
        </motion.form>
      </div>
    </div>
  );
}
