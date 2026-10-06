import Link from "next/link";
import { custName } from "@/data/core";

const cls = "font-medium text-ink underline-offset-2 hover:text-accent hover:underline";
export const CustLink = ({ id, children }: { id: string; children?: React.ReactNode }) => <Link href={`/customers/${id}`} onClick={(e) => e.stopPropagation()} className={cls}>{children ?? custName(id)}</Link>;
export const OrderLink = ({ id }: { id: string }) => <Link href={`/orders/${id}`} onClick={(e) => e.stopPropagation()} className={`${cls} num`}>{id}</Link>;
export const InvLink = ({ id }: { id: string }) => <Link href={`/invoices/${id}`} onClick={(e) => e.stopPropagation()} className={`${cls} num`}>{id}</Link>;
export const DspLink = ({ id }: { id: string }) => <Link href={`/dispatch/${id}`} onClick={(e) => e.stopPropagation()} className={`${cls} num`}>{id}</Link>;
export const ShpLink = ({ id }: { id: string }) => <Link href={`/shipments/${id}`} onClick={(e) => e.stopPropagation()} className={`${cls} num`}>{id}</Link>;
export const ProdLink = ({ id, children }: { id: string; children: React.ReactNode }) => <Link href={`/products/${id}`} onClick={(e) => e.stopPropagation()} className={cls}>{children}</Link>;
