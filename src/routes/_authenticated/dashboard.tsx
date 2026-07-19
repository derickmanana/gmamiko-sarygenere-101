import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { Image as ImageIcon, Video, Sparkles, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { MODULES } from "@/lib/modules";
import { Button } from "@/components/ui/button";

const statsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["stats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("id, result_type, created_at, module")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-muted-foreground">…</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data } = useSuspenseQuery(statsQuery(user!.id));

  const total = data.length;
  const images = data.filter((r) => r.result_type === "image").length;
  const videos = data.filter((r) => r.result_type === "video").length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = data.filter((r) => new Date(r.created_at) >= monthStart).length;

  const stats = [
    { label: t("stat_generations"), value: total, icon: Sparkles, color: "primary" as const },
    { label: t("stat_images"), value: images, icon: ImageIcon, color: "secondary" as const },
    { label: t("stat_videos"), value: videos, icon: Video, color: "primary" as const },
    { label: t("stat_this_month"), value: thisMonth, icon: Clock, color: "secondary" as const },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard_title")}</h1>
        <p className="text-muted-foreground mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color === "primary" ? "gradient-primary" : "gradient-secondary"}`}>
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("tools_title")}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/tools">{t("nav_tools")} <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.slice(0, 6).map((m) => (
            <Link
              key={m.slug}
              to="/tools/$slug"
              params={{ slug: m.slug }}
              className="group rounded-2xl border bg-card p-5 shadow-soft transition-smooth hover:shadow-elegant hover:-translate-y-0.5"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${m.gradient === "primary" ? "gradient-primary" : "gradient-secondary"}`}>
                <m.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-3 font-semibold">{m.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t(m.descKey)}</p>
              {!m.active && <span className="text-xs text-muted-foreground/70 mt-2 inline-block">{t("coming_soon")}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div>
        <h2 className="text-xl font-bold mb-4">{t("recent_activity")}</h2>
        {data.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
            <Sparkles className="h-10 w-10 text-primary mx-auto" />
            <p className="mt-3 text-muted-foreground">{t("empty_history")}</p>
            <Button asChild className="mt-5 gradient-primary text-primary-foreground shadow-elegant">
              <Link to="/tools/$slug" params={{ slug: "product-photography" }}>{t("generate")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.slice(0, 8).map((r) => (
              <div key={r.id} className="rounded-xl border bg-card overflow-hidden shadow-soft">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {r.result_type === "image" ? <ImageIcon className="h-8 w-8 text-muted-foreground" /> : <Video className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium truncate">{r.module}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
