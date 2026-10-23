import { Link } from "@tanstack/react-router";
import { Moon, Sun, Languages } from "lucide-react";
import nptLogo from "@/assets/NPT_old_logo2.png.asset.json";
import nctuLogo from "@/assets/NCTU_Whte_porder_no_BG.png.asset.json";
import { usePrefs } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang, theme, toggleTheme } = usePrefs();
  return (
    <header className="sticky top-0 z-40 bg-brand text-brand-foreground shadow-elegant">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <a href="https://npt-links.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="NPT">
          <img src={nptLogo.url} alt="NCTU Petroleum Tech Chapter logo" className="h-12 w-auto object-contain" />
        </a>
        <span className="h-8 w-px bg-brand-foreground/25" />
        <a href="https://www.facebook.com/nctu.edu.eg/" target="_blank" rel="noopener noreferrer" aria-label="NCTU">
          <img src={nctuLogo.url} alt="New Cairo Technological University logo" className="h-8 w-auto object-contain sm:h-10" />
        </a>
        <nav className="ms-auto hidden items-center gap-5 text-sm md:flex">
          <Link to="/" className="opacity-80 hover:opacity-100" activeOptions={{ exact: true }} activeProps={{ className: "opacity-100 font-semibold" }}>{t("nav_home")}</Link>
          <Link to="/register" className="opacity-80 hover:opacity-100" activeProps={{ className: "opacity-100 font-semibold" }}>{t("nav_register")}</Link>
          <Link to="/recover" className="opacity-80 hover:opacity-100" activeProps={{ className: "opacity-100 font-semibold" }}>{t("nav_recover")}</Link>
        </nav>
        <div className="ms-auto flex items-center gap-2 md:ms-4">
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="inline-flex items-center gap-1.5 rounded-full border border-brand-foreground/25 px-3 py-1.5 text-sm hover:bg-brand-foreground/10">
            <Languages className="h-4 w-4" />{t("lang_switch")}
          </button>
          <button onClick={toggleTheme} aria-label={t("theme_toggle")} className="rounded-full border border-brand-foreground/25 p-2 hover:bg-brand-foreground/10">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = usePrefs();
  return (
    <footer className="bg-brand text-brand-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center md:flex-row md:justify-between md:text-start">
        <div className="flex items-center gap-3">
          <img src={nptLogo.url} alt="NPT" className="h-12 w-auto" />
          <p className="text-sm opacity-80">{t("footer_by")}</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-5 text-sm opacity-80">
          <Link to="/">{t("nav_home")}</Link>
          <Link to="/register">{t("nav_register")}</Link>
          <Link to="/recover">{t("nav_recover")}</Link>
          <Link to="/admin">{t("nav_admin")}</Link>
          <a href="https://npt-links.vercel.app/" target="_blank" rel="noopener noreferrer">NPT</a>
        </nav>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
