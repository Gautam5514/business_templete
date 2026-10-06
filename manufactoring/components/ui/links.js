import Link from "next/link";
const L = ({ href, children }) => <Link href={href} className="font-medium text-ink underline-offset-2 hover:text-accent hover:underline">{children}</Link>;
export const WoLink = ({ id }) => (id && id !== "—" && id.startsWith("WO-") ? <L href={`/production/${id}`}>{id}</L> : <span className="text-mute">{id}</span>);
export const MachineLink = ({ id }) => (id && id !== "—" ? <L href={`/machines/${id}`}>{id}</L> : <span className="text-mute">—</span>);
export const SupplierLink = ({ name, id }) => <L href={`/suppliers/${id}`}>{name}</L>;
export const CustLink = ({ name, id }) => (id ? <L href={`/customers/${id}`}>{name}</L> : <span>{name}</span>);
export const QcLink = ({ id }) => <L href={`/quality/${id}`}>{id}</L>;
export const BatchLink = ({ id }) => <L href={`/finished-goods/${id}`}>{id}</L>;
export { L as TextLink };
