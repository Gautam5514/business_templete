"use client";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/shell/AppShell";

export default function AppLayout({ children }) {
  return <StoreProvider><AppShell>{children}</AppShell></StoreProvider>;
}
