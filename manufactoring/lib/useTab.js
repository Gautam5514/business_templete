"use client";
import { useCallback, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** tab state mirrored into ?tab= so deep links (and the demo story) work */
export function useTab(valid, def) {
  const sp = useSearchParams();
  const path = usePathname();
  const q = sp.get("tab");
  const [tab, setTabState] = useState(valid.includes(q) ? q : def);
  const setTab = useCallback((t) => {
    setTabState(t);
    try { window.history.replaceState(null, "", `${path}?tab=${t}`); } catch {}
  }, [path]);
  return [tab, setTab];
}
