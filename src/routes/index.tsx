import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Zap, Shield, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 backdrop-blur px-4 py-1.5 text-xs font-medium shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Made in Madagascar 🇲🇬</span>
            </div>
            <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
              <span className="text-gradient-primary">GMAMIKO</span>
              <span className="text-secondary">101</span>
              <br />
              <span className="text-foreground">{t("tagline")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("hero_desc")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth h-12 px-8 text-base">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("cta_start")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link to="/auth" search={{ mode: "login" }}>{t("cta_login")}</Link>
              </Button>
            </div>
          </div>

          {/* Flag ribbon */}
          <div className="mt-16 h-1.5 w-full max-w-2xl mx-auto rounded-full gradient-flag animate-fade-up" style={{ animationDelay: "0.2s" }} />
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Zap, label: "Ultra rapide" },
            { icon: Shield, label: "Sécurisé" },
            { icon: Globe2, label: "3 langues" },
            { icon: Sparkles, label: "Qualité HD" },
          ].map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-2">
              <b.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Modules grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold">{t("features_title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("features_sub")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <div
              key={m.slug}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-smooth hover:shadow-elegant hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition-smooth group-hover:opacity-30 ${m.gradient === "primary" ? "gradient-primary" : "gradient-secondary"}`} />
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${m.gradient === "primary" ? "gradient-primary" : "gradient-secondary"} shadow-soft`}>
                <m.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(m.descKey)}</p>
              {!m.active && (
                <span className="mt-3 inline-block text-xs text-muted-foreground/70">{t("coming_soon")}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 sm:p-16 text-center shadow-elegant">
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(400px 200px at 50% 0%, rgba(255,255,255,0.4), transparent)" }} />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-primary-foreground">
            {t("cta_start")}
          </h2>
          <p className="relative mt-3 text-primary-foreground/90 max-w-xl mx-auto">
            {t("hero_desc")}
          </p>
          <Button asChild size="lg" variant="secondary" className="relative mt-8 h-12 px-8 text-base shadow-elegant">
            <Link to="/auth" search={{ mode: "signup" }}>
              {t("cta_signup")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} GMAMIKO101. {t("footer_rights")}</div>
          <div className="h-1 w-32 rounded-full gradient-flag" />
        </div>
      </footer>
    </div>
  );
}
