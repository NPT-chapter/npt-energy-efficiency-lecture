import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { Field, TextInput, PrimaryButton } from "@/components/form-bits";
import { usePrefs, type TKey } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Organizer sign in — NPT Lecture" },
      { name: "description", content: "Sign in for NPT event organizers." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Organizer sign in — NPT" },
      { property: "og:description", content: "Organizer access for the NPT lecture." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ k: TKey; ok?: boolean } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (error) return setMsg({ k: "auth_error" });
      navigate({ to: "/admin", replace: true });
    } else {
      const emailRedirectTo =
        import.meta.env["NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL"] ||
        `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo },
      });
      setLoading(false);
      if (error) return setMsg({ k: "e_server" });
      if (data.session) navigate({ to: "/admin", replace: true });
      else setMsg({ k: "auth_check_email", ok: true });
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl border bg-card p-6 shadow-elegant md:p-8"
        >
          <h1 className="text-2xl font-bold">{t("auth_title")}</h1>
          <Field label={t("f_email")} htmlFor="email">
            <TextInput
              id="email"
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={t("password")} htmlFor="pw">
            <TextInput
              id="pw"
              type="password"
              dir="ltr"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {msg && (
            <p className={msg.ok ? "text-sm text-eco" : "text-sm text-destructive"}>{t(msg.k)}</p>
          )}
          <PrimaryButton type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "in" ? t("sign_in") : t("sign_up")}
          </PrimaryButton>
          <button
            type="button"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="w-full text-sm text-primary hover:underline"
          >
            {mode === "in" ? t("auth_switch_up") : t("auth_switch_in")}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
