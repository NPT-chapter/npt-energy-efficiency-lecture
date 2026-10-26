import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { usePrefs } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Confirm organizer sign in — NPT Lecture" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const callbackUrl = new URL(window.location.href);
    const code = callbackUrl.searchParams.get("code");
    for (const parameter of ["code", "state", "error", "error_code", "error_description"]) {
      callbackUrl.searchParams.delete(parameter);
    }
    window.history.replaceState(
      window.history.state,
      "",
      `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`,
    );

    if (!code) {
      setFailed(true);
      return;
    }

    void supabase.auth
      .exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error || !data.session) {
          setFailed(true);
          return;
        }

        void navigate({ to: "/admin", replace: true });
      })
      .catch(() => setFailed(true));
  }, [navigate]);

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          {!failed && (
            <Loader2 className="mx-auto mb-4 size-6 animate-spin text-primary" aria-hidden="true" />
          )}
          <p
            className="text-sm leading-7 text-muted-foreground"
            role={failed ? "alert" : "status"}
            aria-live="polite"
          >
            {failed ? t("auth_callback_failed") : t("auth_callback_loading")}
          </p>
          {failed && (
            <Link
              className="mt-5 inline-flex font-medium text-primary underline-offset-4 hover:underline"
              to="/auth"
            >
              {t("auth_callback_sign_in")}
            </Link>
          )}
        </div>
      </section>
    </PageShell>
  );
}
