"use client";
import { Suspense } from "react";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/shell/AppShell";
import { PageSkeleton } from "@/components/ui/ui";

export default function AppLayout({ children }) {
  return (
    <StoreProvider>
      <AppShell><Suspense fallback={<PageSkeleton />}>{children}</Suspense></AppShell>
    </StoreProvider>
  );
}
