import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import { toast } from "sonner";
import { Trash2, Image as ImageIcon, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const historyQuery = (userId: string) =>
  queryOptions({
    queryKey: ["history", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-muted-foreground">…</div>}>
        <Content />
      </Suspense>
    </div>
  );
}

function Content() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(historyQuery(user!.id));

  async function del(id: string) {
    const { error } = await supabase.from("generations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["history", user!.id] });
    qc.invalidateQueries({ queryKey: ["stats", user!.id] });
    toast.success("Supprimé");
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-bold mb-6">{t("nav_history")}</h1>
      {data.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center shadow-soft text-muted-foreground">
          {t("empty_history")}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-soft overflow-hidden divide-y">
          {data.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {r.result_type === "image" ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : <Video className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{r.module}</div>
                <div className="text-sm text-muted-foreground truncate">{r.prompt}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => del(r.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
