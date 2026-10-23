import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { Field, TextInput, PrimaryButton } from "@/components/form-bits";
import { CodeCard } from "@/components/CodeCard";
import { usePrefs, type TKey } from "@/lib/i18n";
import { recoverCode } from "@/lib/registration.functions";
import { normalizePhone } from "@/lib/validation";

export const Route = createFileRoute("/recover")({
  head: () => ({
    meta: [
      { title: "Find my attendance code — NPT Lecture" },
      { name: "description", content: "Securely retrieve your NPT lecture attendance code." },
      { property: "og:title", content: "Find my attendance code — NPT Lecture" },
      { property: "og:description", content: "Retrieve your attendance code with your email and phone." },
    ],
  }),
  component: Recover,
});

function Recover() {
  const { t } = usePrefs();
  const recover = useServerFn(recoverCode);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<TKey | null>(null);
  const [result, setResult] = useState<{ fullName: string; attendanceCode: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("e_email");
    if (!normalizePhone(phone)) return setErr("e_phone");
    setLoading(true);
    try {
      const r = await recover({ data: { email, phone } });
      if (r.status === "ok") setResult({ fullName: r.fullName, attendanceCode: r.attendanceCode });
      else setErr(r.status === "not_found" ? "rec_not_found" : r.status === "rate_limited" ? "e_rate" : r.status === "invalid" ? "e_invalid" : "e_server");
    } catch { setErr("e_server"); } finally { setLoading(false); }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="animate-rise rounded-3xl border bg-card p-6 shadow-elegant md:p-10">
          <h1 className="text-3xl font-bold">{t("rec_title")}</h1>
          {result ? (
            <div className="mt-6 space-y-4 text-center">
              <p className="text-lg font-semibold">{result.fullName}</p>
              <CodeCard code={result.attendanceCode} />
              <p className="text-sm text-muted-foreground">{t("ty_instr")}</p>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5">
              <p className="text-muted-foreground">{t("rec_desc")}</p>
              <Field label={t("f_email")} htmlFor="email"><TextInput id="email" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></Field>
              <Field label={t("f_phone")} htmlFor="phone"><TextInput id="phone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={25} placeholder={t("f_phone_ph")} /></Field>
              {err && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{t(err)}</p>}
              <PrimaryButton type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{t("rec_submit")}</PrimaryButton>
            </form>
          )}
          <div className="mt-8 text-center"><Link to="/" className="text-primary hover:underline">{t("back")}</Link></div>
        </div>
      </div>
    </PageShell>
  );
}
