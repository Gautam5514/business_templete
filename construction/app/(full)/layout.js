"use client";
import { StoreProvider } from "@/lib/store";
export default function FullLayout({ children }) { return <StoreProvider>{children}</StoreProvider>; }
