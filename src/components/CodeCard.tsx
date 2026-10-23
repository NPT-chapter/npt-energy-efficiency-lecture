import { Copy } from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/i18n";

export function CodeCard({ code }: { code: string }) {
  const { t } = usePrefs();
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copy_fail"));
    }
  }
  return (
    <div className="rounded-2xl border-2 border-dashed border-eco bg-accent p-6 text-center">
      <p className="text-sm font-medium text-accent-foreground">{t("ty_code_label")}</p>
      <p dir="ltr" className="mt-3 select-all font-mono text-4xl font-bold tracking-[0.25em] text-foreground sm:text-5xl" aria-live="polite">{code}</p>
      <button onClick={copy} className="mt-5 inline-flex items-center gap-2 rounded-full bg-eco px-6 py-3 font-semibold text-eco-foreground">
        <Copy className="h-4 w-4" />{t("copy")}
      </button>
    </div>
  );
}
