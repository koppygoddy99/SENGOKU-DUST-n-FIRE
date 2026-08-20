import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArchiveRestore, BookMarked, ClipboardList, Cog, Gauge, Landmark, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import "./adminConsole.css";

type AdminSection = "overview" | "campaigns" | "content" | "operations" | "audit" | "settings";
type AdminOverview = {
  product: { name: string; mode: string };
  systems: Array<{ id: string; label: string; status: "ready" | "safe-fallback" | "planned" | "not-configured"; detail: string }>;
  review: { manifestRequired: boolean; rule: string };
};

const adminMenu: Array<{ id: AdminSection; icon: typeof Gauge; label: string; thai: string; path: string; folio: string }> = [
  { id: "overview", icon: Gauge, label: "Office Overview", thai: "ภาพรวมสำนักงาน", path: "/admin", folio: "01" },
  { id: "campaigns", icon: ArchiveRestore, label: "Campaign Boundaries", thai: "ขอบเขตแคมเปญ", path: "/admin/campaigns", folio: "02" },
  { id: "content", icon: BookMarked, label: "Historical Reference", thai: "หลักฐานและบริบท", path: "/admin/content", folio: "03" },
  { id: "operations", icon: Landmark, label: "Runtime & Fallbacks", thai: "การทำงานและทางสำรอง", path: "/admin/operations", folio: "04" },
  { id: "audit", icon: ClipboardList, label: "Audit Policy", thai: "นโยบายตรวจสอบ", path: "/admin/audit", folio: "05" },
  { id: "settings", icon: Cog, label: "Controlled Settings", thai: "การตั้งค่าควบคุม", path: "/admin/settings", folio: "06" },
];

const sectionCopy: Record<AdminSection, { eyebrow: string; title: string; summary: string }> = {
  overview: { eyebrow: "WAR OFFICE · APPLICATION LEDGER", title: "Office Overview", summary: "A factual register of implemented application boundaries. This office does not invent usage, player, provider, or history data." },
  campaigns: { eyebrow: "CAMPAIGN CUSTODY", title: "Campaign Boundaries", summary: "Campaigns remain in the player browser until an explicit consented persistence model, retention rule, and access policy are implemented." },
  content: { eyebrow: "REFERENCE DESK", title: "Historical Reference", summary: "Maintain the distinction between evidence, contextual play, campaign fiction, and insufficient evidence before editable content tools are introduced." },
  operations: { eyebrow: "OPERATIONS DESK", title: "Runtime & Fallbacks", summary: "Operational marks report implemented safeguards only. This console does not represent live provider health without an observed service contract." },
  audit: { eyebrow: "SEAL & AUDIT", title: "Audit Policy", summary: "State-changing controls stay withheld until actor identity, append-only records, timestamps, and retention policy are implemented." },
  settings: { eyebrow: "CONTROLLED SETTINGS", title: "Controlled Settings", summary: "Only audited and server-validated controls belong here. Secrets and untracked feature flags are not exposed in this office." },
};

function currentSection(path: string): AdminSection {
  return adminMenu.find((entry) => entry.path === path)?.id ?? "overview";
}

function OfficeGate({ type, onReturn }: { type: "loading" | "signin" | "denied"; onReturn?: () => void }) {
  if (type === "loading") return <main className="admin-gate"><div className="admin-gate__seal">火</div><p className="admin-kicker">WAR OFFICE · ACCESS REGISTER</p><Loader2 className="admin-gate__loader" aria-label="Loading access" /><p>Checking the office seal…</p></main>;
  const denied = type === "denied";
  return <main className="admin-gate"><section className="admin-gate__paper"><div className="admin-gate__seal">{denied ? "禁" : "火"}</div>{denied ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}<p className="admin-kicker">{denied ? "SEAL NOT GRANTED" : "WAR OFFICE · SIGN IN"}</p><h1>{denied ? "Administrator access required" : "Enter the administration ledger"}</h1><p>{denied ? "Your player account cannot inspect operations or administrator records." : "Sign in with an administrator account. Player campaign records are not displayed in this office."}</p>{denied ? <Button className="df-button df-button--ghost" onClick={onReturn}>Return to Dust &amp; Fire</Button> : <Button className="df-button df-button--primary" onClick={startLogin}>Sign in as administrator</Button>}</section></main>;
}

function StatusMark({ status }: { status: AdminOverview["systems"][number]["status"] }) {
  const label = status === "safe-fallback" ? "Fallback" : status.replace(/-/g, " ");
  return <span className={`admin-status admin-status--${status}`}>{label}</span>;
}

function AdminBody({ section, overview, loading }: { section: AdminSection; overview: AdminOverview | undefined; loading: boolean }) {
  if (loading) return <section className="admin-loading-ledger" aria-label="Loading administration data"><p className="admin-kicker">READING OFFICE LEDGER</p>{[1, 2, 3].map((row) => <div key={row}><span /><strong /><i /></div>)}</section>;
  if (!overview) return <section className="admin-notice"><ShieldAlert size={24} /><div><p className="admin-kicker">NO OFFICE RECORD RETURNED</p><h2>Operational data is unavailable</h2><p>No state was changed. The console will remain read-only until a server response is available.</p></div></section>;
  if (section === "campaigns") return <AdminNotice icon={ArchiveRestore} title="No remote campaign database" detail="Campaign Library persists in local browser storage. Central campaign access is intentionally unavailable until consent, a database policy, and retention terms exist." />;
  if (section === "content") return <AdminNotice icon={BookMarked} title="Content review protocol" detail="Each future entry must retain one historical boundary label: fact-supported, contextual-play, campaign-fiction, or insufficient-evidence. No batch editor is active." />;
  if (section === "audit") return <AdminNotice icon={ClipboardList} title="Audit storage is not configured" detail="Mutable administrator controls are withheld until append-only audit records, actor identity, timestamps, and retention rules are available." />;
  if (section === "settings") return <AdminNotice icon={Cog} title="No live settings exposed" detail="Feature flags and secrets are intentionally absent. Future settings must be server-validated, role-gated, confirmed, and recorded." />;
  return <section className="admin-system-ledger"><div className="admin-system-ledger__head"><span>FOLIO</span><span>SYSTEM</span><span>OFFICE MARK</span><span>IMPLEMENTED BOUNDARY</span></div>{overview.systems.map((system, index) => <article key={system.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{system.label}</strong><StatusMark status={system.status} /><p>{system.detail}</p></article>)}</section>;
}

function AdminNotice({ icon: Icon, title, detail }: { icon: typeof ShieldCheck; title: string; detail: string }) {
  return <section className="admin-notice"><Icon size={24} /><div><p className="admin-kicker">OFFICE BOUNDARY</p><h2>{title}</h2><p>{detail}</p></div></section>;
}

export function AdminConsole() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const isAdmin = user?.role === "admin";
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: isAdmin, retry: false, refetchOnWindowFocus: false });
  if (loading) return <OfficeGate type="loading" />;
  if (!user) return <OfficeGate type="signin" />;
  if (!isAdmin) return <OfficeGate type="denied" onReturn={() => setLocation("/")} />;
  const section = currentSection(location);
  const content = sectionCopy[section];
  const activeEntry = adminMenu.find((entry) => entry.id === section)!;

  return <div className="admin-ledger">
    <aside className="admin-ledger__spine"><div className="admin-ledger__brand"><span>火</span><div><strong>Dust &amp; Fire</strong><small>WAR OFFICE</small></div></div><div className="admin-ledger__folio"><small>APPLICATION FOLIO</small><strong>{activeEntry.folio}</strong><span>{content.eyebrow}</span></div><nav aria-label="Administrator sections">{adminMenu.map((item) => { const Icon = item.icon; return <button key={item.id} className={item.id === section ? "is-active" : ""} onClick={() => setLocation(item.path)}><span>{item.folio}</span><Icon size={15} /><div><strong>{item.label}</strong><small>{item.thai}</small></div></button>; })}</nav><div className="admin-ledger__identity"><span className="admin-ledger__identity-mark">印</span><div><small>OFFICE ACCOUNT</small><strong>{user.name || "Administrator"}</strong><button onClick={() => setLocation("/")}>Return to player ledger</button></div></div></aside>
    <main className="admin-ledger__main"><header className="admin-ledger__header"><div><p className="admin-kicker">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.summary}</p></div><div className="admin-ledger__seal"><span>火</span><small>READ ONLY</small></div></header><AdminBody section={section} overview={overview.data} loading={overview.isLoading} /></main>
  </div>;
}
