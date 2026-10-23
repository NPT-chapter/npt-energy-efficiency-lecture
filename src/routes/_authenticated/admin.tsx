import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, LogOut, Loader2, ScanLine } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { TextInput, SelectInput } from "@/components/form-bits";
import { usePrefs, type TKey } from "@/lib/i18n";
import { getMyAccess, getStats, listRegistrations, checkInCode } from "@/lib/admin.functions";
import { ACADEMIC_YEARS, DISCOVERY_SOURCES } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Organizer dashboard — NPT Lecture" },
      { name: "description", content: "Registrations and attendance for NPT organizers." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Organizer dashboard — NPT" },
      { property: "og:description", content: "Organizer-only dashboard." },
    ],
  }),
  component: Admin,
});

const PAGE = 20;

function Admin() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const access = useServerFn(getMyAccess);
  const { data: acc, isLoading } = useQuery({ queryKey: ["access"], queryFn: () => access() });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{t("adm_title")}</h1>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><LogOut className="h-4 w-4" />{t("sign_out")}</button>
        </div>
        {isLoading ? <Loader2 className="mt-10 h-6 w-6 animate-spin" /> : acc?.organizer ? <Dashboard /> : (
          <p className="mt-8 rounded-xl border bg-card p-6">{t("adm_denied")}</p>
        )}
      </div>
    </PageShell>
  );
}

function Dashboard() {
  const { t } = usePrefs();
  const stats = useServerFn(getStats);
  const list = useServerFn(listRegistrations);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);

  const s = useQuery({ queryKey: ["stats"], queryFn: () => stats() });
  const l = useQuery({ queryKey: ["regs", search, year, source, page], queryFn: () => list({ data: { search, year, source, page, pageSize: PAGE } }) });
  const pages = Math.max(1, Math.ceil((l.data?.count ?? 0) / PAGE));

  async function exportCsv() {
    setExporting(true);
    try {
      const all = await list({ data: { search, year, source, page: 0, pageSize: 5000 } });
      const cols = ["full_name", "has_student_code", "student_code", "academic_year", "discovery_source", "phone", "email", "attendance_code", "checked_in_at", "created_at"] as const;
      const esc = (v: unknown) => { const x = v == null ? "" : String(v); return /[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x; };
      const csv = "\uFEFF" + [cols.join(","), ...all.rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = "npt-registrations.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setExporting(false); }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label={t("adm_total")} value={s.data?.total} />
        <Stat label={t("adm_checked")} value={s.data?.checkedIn} />
        <Breakdown title={t("adm_by_year")} data={s.data?.byYear} prefix="year_" />
        <Breakdown title={t("adm_by_source")} data={s.data?.bySource} prefix="src_" />
      </div>

      <CheckIn onDone={() => { s.refetch(); l.refetch(); }} />

      <div className="rounded-2xl border bg-card p-4 shadow-elegant">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_220px_auto]">
          <TextInput placeholder={t("adm_search")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          <SelectInput value={year} onChange={(e) => { setYear(e.target.value); setPage(0); }}>
            <option value="">{t("adm_all_years")}</option>
            {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{t(`year_${y}` as TKey)}</option>)}
          </SelectInput>
          <SelectInput value={source} onChange={(e) => { setSource(e.target.value); setPage(0); }}>
            <option value="">{t("adm_all_sources")}</option>
            {DISCOVERY_SOURCES.map((x) => <option key={x} value={x}>{t(`src_${x}` as TKey)}</option>)}
          </SelectInput>
          <button onClick={exportCsv} disabled={exporting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{t("adm_export")}
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b text-start">
                {(["col_name", "col_code", "col_year", "col_source", "col_phone", "col_email", "col_att", "col_date"] as TKey[]).map((c) => <th key={c} className="px-3 py-2 text-start font-medium">{t(c)}</th>)}
              </tr>
            </thead>
            <tbody>
              {l.data?.rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{r.full_name}</td>
                  <td className="px-3 py-2" dir="ltr">{r.student_code ?? t("none")}</td>
                  <td className="px-3 py-2">{t(`year_${r.academic_year}` as TKey)}</td>
                  <td className="px-3 py-2">{t(`src_${r.discovery_source}` as TKey)}</td>
                  <td className="px-3 py-2" dir="ltr">{r.phone}</td>
                  <td className="px-3 py-2" dir="ltr">{r.email}</td>
                  <td className="px-3 py-2">{r.checked_in_at ? <span className="text-eco font-medium">{t("present")}</span> : <span className="text-muted-foreground">{t("absent")}</span>}</td>
                  <td className="px-3 py-2 whitespace-nowrap" dir="ltr">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {l.isLoading && <Loader2 className="m-4 h-5 w-5 animate-spin" />}
        </div>
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">{t("adm_prev")}</button>
          <span>{t("adm_page")} {page + 1} / {pages}</span>
          <button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">{t("adm_next")}</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-elegant">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold">{value ?? "…"}</p>
    </div>
  );
}

function Breakdown({ title, data, prefix }: { title: string; data?: Record<string, number>; prefix: string }) {
  const { t } = usePrefs();
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-elegant">
      <p className="text-sm text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {Object.entries(data ?? {}).map(([k, v]) => (
          <li key={k} className="flex justify-between gap-2"><span>{t(`${prefix}${k}` as TKey)}</span><span className="font-semibold">{v}</span></li>
        ))}
      </ul>
    </div>
  );
}

function CheckIn({ onDone }: { onDone: () => void }) {
  const { t } = usePrefs();
  const check = useServerFn(checkInCode);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Awaited<ReturnType<typeof checkInCode>> | null>(null);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try { setRes(await check({ data: { code } })); onDone(); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={go} className="rounded-2xl border bg-card p-5 shadow-elegant">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><ScanLine className="h-5 w-5" />{t("chk_title")}</h2>
      <div className="mt-3 flex gap-3">
        <TextInput dir="ltr" placeholder={t("chk_ph")} value={code} maxLength={8} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <button disabled={busy} className="rounded-xl bg-eco px-5 font-semibold text-eco-foreground disabled:opacity-60">{t("chk_btn")}</button>
      </div>
      {res && (
        <p className={`mt-3 text-sm font-medium ${res.status === "valid" ? "text-eco" : "text-destructive"}`}>
          {res.status === "valid" ? `${t("chk_valid")} ${res.fullName}` : res.status === "used" ? `${t("chk_used")} ${res.fullName}` : t("chk_invalid")}
        </p>
      )}
    </form>
  );
}
