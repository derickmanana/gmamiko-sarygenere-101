import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Download, Upload, Sparkles } from "lucide-react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { MODULES } from "@/lib/modules";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/tools/$slug")({
  loader: ({ params }) => {
    const mod = MODULES.find((m) => m.slug === params.slug);
    if (!mod) throw notFound();
    return { mod };
  },
  component: ToolDetail,
});

function ToolDetail() {
  const { mod } = Route.useLoaderData();
  const { t } = useI18n();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image trop grande (max 10MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function handleGenerate() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setProgress(5);
    setResult(null);
    setIsFinal(false);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, refImage, module: mod.slug }),
      });
      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || t("error_generic"));
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let frameCount = 0;
      let finalB64: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const payload = JSON.parse(data);
            const evtType = payload.type;
            if (evtType === "error" || payload.error) {
              throw new Error(payload.error?.message ?? t("error_generic"));
            }
            const b64 = payload.b64_json ?? payload.data?.[0]?.b64_json;
            if (!b64) continue;
            const dataUrl = `data:image/png;base64,${b64}`;
            const final = evtType === "image_generation.completed";
            frameCount++;
            flushSync(() => {
              setResult(dataUrl);
              setIsFinal(final);
              setProgress(final ? 100 : Math.min(90, 20 + frameCount * 15));
            });
            if (final) finalB64 = b64;
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }

      if (!finalB64 && !result) throw new Error(t("error_generic"));

      // Save history
      await supabase.from("generations").insert({
        user_id: user!.id,
        module: mod.slug,
        prompt,
        result_type: "image",
        result_url: null,
        status: "completed",
      });

      toast.success(t("success_generated"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error_generic");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function downloadResult() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `gmamiko101-${mod.slug}-${Date.now()}.png`;
    a.click();
  }

  const Icon = mod.icon;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-up">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/tools"><ArrowLeft className="h-4 w-4 mr-1" /> {t("nav_tools")}</Link>
      </Button>

      <div className="flex items-start gap-4 mb-8">
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${mod.gradient === "primary" ? "gradient-primary" : "gradient-secondary"} shadow-elegant`}>
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{mod.name}</h1>
          <p className="text-muted-foreground">{t(mod.descKey)}</p>
        </div>
      </div>

      {!mod.active ? (
        <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
          <Sparkles className="h-10 w-10 text-primary mx-auto" />
          <h2 className="mt-3 text-xl font-semibold">{t("coming_soon")}</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Ce module fait partie de la feuille de route GMAMIKO101 et sera activé prochainement.
          </p>
          <Button asChild className="mt-6 gradient-primary text-primary-foreground shadow-elegant">
            <Link to="/tools/$slug" params={{ slug: "product-photography" }}>AI Product Photography</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
              <div className="space-y-2">
                <Label>{t("upload_photo")}</Label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer hover:bg-accent/40 transition-smooth">
                  {refImage ? (
                    <img src={refImage} alt="ref" className="max-h-40 rounded-lg" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">PNG, JPG · 10MB max</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={busy} />
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">{t("prompt_label")}</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t("prompt_placeholder")}
                  rows={4}
                  disabled={busy}
                  maxLength={1000}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={busy || !prompt.trim()}
                className="w-full h-11 gradient-primary text-primary-foreground shadow-elegant"
              >
                {busy ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("generating")}</>) : (<><Sparkles className="h-4 w-4 mr-2" />{t("generate")}</>)}
              </Button>
              {busy && <Progress value={progress} className="h-2" />}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center relative">
              {result ? (
                <img
                  src={result}
                  alt="result"
                  className={`w-full h-full object-cover transition-[filter] duration-500 ${isFinal ? "blur-0" : "blur-xl"}`}
                />
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <Sparkles className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-sm">Le résultat apparaîtra ici</p>
                </div>
              )}
            </div>
            {result && isFinal && (
              <Button onClick={downloadResult} className="w-full mt-4" variant="outline">
                <Download className="h-4 w-4 mr-2" /> {t("download")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
