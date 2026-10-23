import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { CodeCard } from "@/components/CodeCard";
import { usePrefs } from "@/lib/i18n";
import { getLastRegistration } from "@/lib/code-store";
import { EVENT_TITLE } from "@/lib/event";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Registration confirmed — NPT Lecture" },
      { name: "description", content: "Your registration for the NPT energy efficiency lecture is confirmed." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Registration confirmed — NPT Lecture" },
      { property: "og:description", content: "Your NPT lecture attendance code." },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { t } = usePrefs();
  const [reg, setReg] = useState<ReturnType<typeof getLastRegistration>>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReg(getLastRegistration()); setReady(true); }, []);

  return (
    <PageShell>
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="animate-rise rounded-3xl border bg-card p-6 text-center shadow-elegant md:p-10">
          {ready && reg ? (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-eco" />
              <h1 className="mt-4 text-3xl font-bold">{t("ty_title")}</h1>
              <p className="mt-2 text-muted-foreground" dir="ltr">{EVENT_TITLE}</p>
              <p className="mt-4 text-lg">{t("ty_hello")}, <span className="font-semibold">{reg.fullName}</span></p>
              <div className="mt-6"><CodeCard code={reg.attendanceCode} /></div>
              <p className="mt-5 text-sm text-muted-foreground">{t("ty_instr")}</p>
            </>
          ) : ready ? (
            <>
              <p className="text-muted-foreground">{t("ty_missing")}</p>
              <Link to="/recover" className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{t("nav_recover")}</Link>
            </>
          ) : null}
          <div className="mt-8">
            <Link to="/" className="text-primary underline-offset-4 hover:underline">{t("back")}</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
