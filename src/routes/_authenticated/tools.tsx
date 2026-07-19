import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/_authenticated/tools")({
  component: Tools,
});

function Tools() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("tools_title")}</h1>
        <p className="text-muted-foreground mt-1">{t("tools_sub")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.slug}
            to="/tools/$slug"
            params={{ slug: m.slug }}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-smooth hover:shadow-elegant hover:-translate-y-1"
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition-smooth group-hover:opacity-30 ${m.gradient === "primary" ? "gradient-primary" : "gradient-secondary"}`} />
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${m.gradient === "primary" ? "gradient-primary" : "gradient-secondary"} shadow-soft`}>
              <m.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">{m.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t(m.descKey)}</p>
            {!m.active && <span className="mt-3 inline-block text-xs text-muted-foreground/70">{t("coming_soon")}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
