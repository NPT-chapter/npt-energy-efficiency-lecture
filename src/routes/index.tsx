import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gauge, Leaf, Factory, Linkedin, CalendarClock } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { usePrefs } from "@/lib/i18n";
import { EVENT_TITLE, SPEAKER_NAME, EVENT_SCHEDULE, allowNewRegistration } from "@/lib/event";
import speaker from "@/assets/Zeinab_Ibrahim.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decarbonization & Energy Efficiency in Midstream Gas — NPT Lecture" },
      { name: "description", content: "Free NPT lecture by Dr. Zeinab Ibrahim (GASCO) on energy efficiency and decarbonization in midstream gas operations. Register now." },
      { property: "og:title", content: "Decarbonization & Energy Efficiency in Midstream Gas — NPT" },
      { property: "og:description", content: "Lecture by Dr. Zeinab Ibrahim, Energy Efficiency Section Head at GASCO. Register for your attendance code." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = usePrefs();
  const cards = [
    { icon: Gauge, title: t("ov1_t"), desc: t("ov1_d") },
    { icon: Leaf, title: t("ov2_t"), desc: t("ov2_d") },
    { icon: Factory, title: t("ov3_t"), desc: t("ov3_d") },
  ];
  return (
    <PageShell>
      <section className="bg-hero text-brand-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-brand-foreground/20 px-3 py-1 text-xs font-medium uppercase tracking-widest text-eco">
            <span className="h-1.5 w-1.5 rounded-full bg-eco" />{t("hero_kicker")}
          </p>
          <h1 dir="ltr" className="animate-rise mt-6 max-w-4xl text-4xl font-bold leading-[1.1] md:text-6xl [animation-delay:80ms] rtl:text-right">{EVENT_TITLE}</h1>
          <p className="animate-rise mt-6 max-w-2xl text-lg opacity-85 [animation-delay:160ms]">{t("hero_intro")}</p>
          <p className="animate-rise mt-3 font-display text-lg [animation-delay:200ms]">{SPEAKER_NAME}</p>
          <div className="animate-rise mt-10 flex flex-wrap items-center gap-4 [animation-delay:260ms]">
            {allowNewRegistration() ? (
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-eco px-7 py-3.5 font-semibold text-eco-foreground shadow-elegant transition-transform hover:-translate-y-0.5">
                {t("register_now")}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            ) : (
              <Link to="/recover" className="inline-flex items-center gap-2 rounded-full bg-eco px-7 py-3.5 font-semibold text-eco-foreground shadow-elegant transition-transform hover:-translate-y-0.5">
                {t("nav_recover")}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            )}
            <span className="inline-flex items-center gap-2 text-sm opacity-80"><CalendarClock className="h-4 w-4" />{EVENT_SCHEDULE ? EVENT_SCHEDULE[lang] : t("schedule_tba")}</span>
          </div>
          {!allowNewRegistration() && <p className="animate-rise mt-4 max-w-2xl text-sm font-semibold text-eco [animation-delay:300ms]">{t("hero_closed")}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold md:text-4xl">{t("overview_title")}</h2>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{t("overview_lead")}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-card p-6 shadow-elegant">
              <div className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground"><Icon className="h-6 w-6" /></div>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-20 md:grid-cols-[320px_1fr]">
          <div className="overflow-hidden rounded-3xl border-4 border-card shadow-elegant">
            <img src={speaker.url} alt={SPEAKER_NAME} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-eco">{t("speaker_title")}</p>
            <h2 dir="ltr" className="mt-2 text-3xl font-bold md:text-4xl rtl:text-right">{SPEAKER_NAME}</h2>
            <p className="mt-2 font-medium text-primary">{t("speaker_role")}</p>
            <div className="mt-6 space-y-4 leading-relaxed text-foreground/85">
              <p>{t("bio1")}</p>
              <p>{t("bio2")}</p>
            </div>
            <a href="https://www.linkedin.com/in/zeinabibrahim/?isSelfProfile=false" target="_blank" rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
              <Linkedin className="h-4 w-4" />{t("linkedin")}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="bg-hero rounded-3xl p-10 text-center text-brand-foreground shadow-elegant md:p-16">
          {allowNewRegistration() ? (
            <>
              <h2 className="text-3xl font-bold md:text-4xl">{t("cta_title")}</h2>
              <p className="mx-auto mt-4 max-w-xl opacity-85">{t("cta_desc")}</p>
              <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-eco px-7 py-3.5 font-semibold text-eco-foreground">
                {t("register_now")}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold md:text-4xl">{t("closed_title")}</h2>
              <p className="mx-auto mt-4 max-w-xl opacity-85">{t("closed_short")}</p>
              <Link to="/recover" className="mt-8 inline-flex items-center gap-2 rounded-full bg-eco px-7 py-3.5 font-semibold text-eco-foreground">
                {t("nav_recover")}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
