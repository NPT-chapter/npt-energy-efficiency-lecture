import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { Field, TextInput, SelectInput, PrimaryButton } from "@/components/form-bits";
import { usePrefs, type TKey } from "@/lib/i18n";
import { registerStudent } from "@/lib/registration.functions";
import { registrationSchema, ACADEMIC_YEARS, DISCOVERY_SOURCES } from "@/lib/validation";
import { setLastRegistration } from "@/lib/code-store";
import { EVENT_TITLE } from "@/lib/event";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — NPT Energy Efficiency Lecture" },
      { name: "description", content: "Register for the NPT lecture on decarbonization and energy efficiency and get your attendance code." },
      { property: "og:title", content: "Register — NPT Energy Efficiency Lecture" },
      { property: "og:description", content: "Student registration for Dr. Zeinab Ibrahim's lecture." },
    ],
  }),
  component: RegisterPage,
});

type Errors = Partial<Record<"fullName" | "studentCode" | "academicYear" | "discoverySource" | "phone" | "email", TKey>>;
const errKey: Record<string, TKey> = {
  fullName: "e_name", studentCode: "e_studentCode", academicYear: "e_academicYear",
  discoverySource: "e_discoverySource", phone: "e_phone", email: "e_email",
};

function RegisterPage() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const register = useServerFn(registerStudent);
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<TKey | null>(null);
  const [f, setF] = useState({ fullName: "", studentCode: "", noCode: false, academicYear: "", discoverySource: "", phone: "", email: "" });
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    setFormError(null);
    const payload = {
      fullName: f.fullName, hasStudentCode: !f.noCode, studentCode: f.noCode ? null : f.studentCode,
      academicYear: f.academicYear, discoverySource: f.discoverySource, phone: f.phone, email: f.email,
    };
    const parsed = registrationSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const i of parsed.error.issues) { const k = errKey[String(i.path[0])]; if (k) next[i.path[0] as keyof Errors] = k; }
      setErrors(next);
      return;
    }
    setErrors({});
    busy.current = true;
    setLoading(true);
    try {
      const res = await register({ data: parsed.data });
      if (res.status === "ok") {
        setLastRegistration({ fullName: res.fullName, attendanceCode: res.attendanceCode });
        navigate({ to: "/thank-you" });
        return;
      }
      setFormError(res.status === "duplicate" ? "e_duplicate" : res.status === "rate_limited" ? "e_rate" : res.status === "invalid" ? "e_invalid" : "e_server");
    } catch {
      setFormError("e_server");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="bg-hero">
        <div className="mx-auto max-w-2xl px-4 pb-10 pt-14 text-brand-foreground">
          <p className="text-sm font-medium text-eco" dir="ltr">{EVENT_TITLE}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{t("reg_title")}</h1>
          <p className="mt-2 opacity-85">{t("reg_desc")}</p>
        </div>
      </div>
      <div className="mx-auto -mt-4 max-w-2xl px-4 pb-20">
        <form noValidate onSubmit={onSubmit} className="animate-rise space-y-5 rounded-3xl border bg-card p-6 shadow-elegant md:p-8">
          <Field label={t("f_name")} htmlFor="fullName" error={errors.fullName && t(errors.fullName)}>
            <TextInput id="fullName" autoComplete="name" placeholder={t("f_name_ph")} value={f.fullName} onChange={(e) => set("fullName", e.target.value)} maxLength={150} />
          </Field>
          <Field label={t("f_code")} htmlFor="studentCode" error={errors.studentCode && t(errors.studentCode)}>
            <TextInput id="studentCode" disabled={f.noCode} value={f.studentCode} onChange={(e) => set("studentCode", e.target.value)} maxLength={30} />
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-primary" checked={f.noCode}
                onChange={(e) => setF((p) => ({ ...p, noCode: e.target.checked, studentCode: e.target.checked ? "" : p.studentCode }))} />
              {t("f_no_code")}
            </label>
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("f_year")} htmlFor="academicYear" error={errors.academicYear && t(errors.academicYear)}>
              <SelectInput id="academicYear" value={f.academicYear} onChange={(e) => set("academicYear", e.target.value)}>
                <option value="" disabled>{t("select_ph")}</option>
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{t(`year_${y}` as TKey)}</option>)}
              </SelectInput>
            </Field>
            <Field label={t("f_source")} htmlFor="discoverySource" error={errors.discoverySource && t(errors.discoverySource)}>
              <SelectInput id="discoverySource" value={f.discoverySource} onChange={(e) => set("discoverySource", e.target.value)}>
                <option value="" disabled>{t("select_ph")}</option>
                {DISCOVERY_SOURCES.map((s) => <option key={s} value={s}>{t(`src_${s}` as TKey)}</option>)}
              </SelectInput>
            </Field>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("f_phone")} htmlFor="phone" error={errors.phone && t(errors.phone)}>
              <TextInput id="phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder={t("f_phone_ph")} value={f.phone} onChange={(e) => set("phone", e.target.value)} maxLength={25} />
            </Field>
            <Field label={t("f_email")} htmlFor="email" error={errors.email && t(errors.email)}>
              <TextInput id="email" type="email" dir="ltr" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} maxLength={255} />
            </Field>
          </div>
          <p className="flex items-start gap-2 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{t("privacy")}
          </p>
          {formError && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{t(formError)}</p>}
          <PrimaryButton type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? t("submitting") : t("submit")}
          </PrimaryButton>
          <p className="text-center text-sm"><Link to="/recover" className="text-primary underline-offset-4 hover:underline">{t("find_code_link")}</Link></p>
        </form>
      </div>
    </PageShell>
  );
}
