import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Download, Upload, Sparkles, Share2, Video as VideoIcon, Check } from "lucide-react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/create/video")({
  component: CreateVideo,
});

const CATEGORIES = [
  { id: "fashion", fr: "Mode & Vêtements", mg: "Fitafiana", en: "Fashion" },
  { id: "food", fr: "Nourriture & Boissons", mg: "Sakafo", en: "Food & Drinks" },
  { id: "beauty", fr: "Beauté & Cosmétiques", mg: "Hatsaram-bika", en: "Beauty" },
  { id: "electronics", fr: "Électronique", mg: "Elektronika", en: "Electronics" },
  { id: "home", fr: "Maison & Décoration", mg: "Trano", en: "Home & Decor" },
  { id: "jewelry", fr: "Bijoux & Accessoires", mg: "Firavaka", en: "Jewelry" },
  { id: "other", fr: "Autre", mg: "Hafa", en: "Other" },
];

const STYLES = [
  { id: "auto", fr: "Automatique", mg: "Ho azy", en: "Automatic", desc: "Recommandé", prompt: "cinematic product ad, smooth motion" },
  { id: "dynamic", fr: "Dynamique", mg: "Mavitrika", en: "Dynamic", desc: "Coupes rapides", prompt: "energetic product ad, fast cuts, punchy motion" },
  { id: "luxe", fr: "Luxe", mg: "Hatsaran-tsara", en: "Luxury", desc: "Slow-motion premium", prompt: "luxury slow-motion product ad, cinematic lighting, premium mood" },
  { id: "custom", fr: "Personnalisé", mg: "Manokana", en: "Custom", desc: "Décrivez votre idée", prompt: "" },
];

function CreateVideo() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const L = (fr: string, mg: string, en: string) => (locale === "mg" ? mg : locale === "en" ? en : fr);

  const [refImage, setRefImage] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [duration, setDuration] = useState<6 | 10>(6);
  const [style, setStyle] = useState<string>("auto");
  const [customPrompt, setCustomPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error(L("Image trop grande", "Sary lehibe loatra", "Image too large"));
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(f);
  }

  function buildPrompt() {
    const cat = CATEGORIES.find((c) => c.id === category);
    const st = STYLES.find((s) => s.id === style)!;
    return [
      "advertising poster / video keyframe for a",
      cat ? cat.en : "product",
      `${duration}s ad`,
      st.prompt || customPrompt,
      "high resolution, motion-ready composition",
    ].filter(Boolean).join(", ");
  }

  async function handleGenerate() {
    if (!refImage || !category || busy) return;
    if (style === "custom" && !customPrompt.trim()) return toast.error(L("Décrivez votre style", "Lazao ny fombanao", "Describe your style"));

    setBusy(true); setProgress(5); setResult(null); setIsFinal(false);
    try {
      // Video generation isn't wired to a video API yet — generate a hero keyframe (poster)
      // via the existing image pipeline so the flow is fully functional.
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(), refImage, module: "video" }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text().catch(() => "Error"));

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = ""; let frameCount = 0; let finalB64: string | null = null;
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
            if (payload.type === "error" || payload.error) throw new Error(payload.error?.message ?? "Error");
            const b64 = payload.b64_json ?? payload.data?.[0]?.b64_json;
            if (!b64) continue;
            const dataUrl = `data:image/png;base64,${b64}`;
            const final = payload.type === "image_generation.completed";
            frameCount++;
            flushSync(() => {
              setResult(dataUrl); setIsFinal(final);
              setProgress(final ? 100 : Math.min(90, 20 + frameCount * 15));
            });
            if (final) finalB64 = b64;
          } catch { /* ignore partials */ }
        }
      }
      if (!finalB64 && !result) throw new Error("No output");

      await supabase.from("generations").insert({
        user_id: user!.id,
        module: "video",
        prompt: buildPrompt(),
        result_type: "image",
        result_url: null,
        status: "completed",
      });
      toast.success(L("Aperçu vidéo généré", "Vita ny aperçu", "Preview ready"));
      toast.info(L("Génération vidéo complète bientôt disponible", "Video feno ho avy tsy ho ela", "Full video generation coming soon"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function downloadResult() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `gmamiko101-video-${duration}s-${Date.now()}.png`;
    a.click();
  }

  async function shareResult() {
    if (!result) return;
    try {
      const blob = await (await fetch(result)).blob();
      const file = new File([blob], "gmamiko101.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "GMAMIKO101", text: "Créé avec GMAMIKO101 🇲🇬" });
      } else if (navigator.share) {
        await navigator.share({ title: "GMAMIKO101" });
      } else {
        downloadResult();
      }
    } catch { /* cancelled */ }
  }

  function reset() { setResult(null); setIsFinal(false); setProgress(0); }

  if (result && isFinal) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 animate-fade-up">
        <div className="rounded-3xl overflow-hidden border shadow-elegant bg-card relative">
          <img src={result} alt="result" className="w-full aspect-square object-cover" />
          <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs text-white font-medium">
            🎥 {duration}s · {L("Aperçu", "Aperçu", "Preview")}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Button onClick={downloadResult} size="lg" className="h-14 gradient-primary text-primary-foreground shadow-elegant text-base font-semibold">
            <Download className="h-5 w-5 mr-2" /> {L("Télécharger", "Alaivo", "Download")}
          </Button>
          <Button onClick={shareResult} size="lg" variant="outline" className="h-14 text-base font-semibold border-2">
            <Share2 className="h-5 w-5 mr-2" /> {L("Partager", "Zarao", "Share")}
          </Button>
        </div>
        <Button onClick={reset} variant="ghost" className="w-full mt-3">
          <Sparkles className="h-4 w-4 mr-2" /> {L("Nouvelle création", "Vaovao", "New creation")}
        </Button>
      </div>
    );
  }

  const canGenerate = refImage && category && (style !== "custom" || customPrompt.trim());

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 animate-fade-up">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> {L("Retour", "Miverina", "Back")}</Link>
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-2xl gradient-secondary flex items-center justify-center shadow-elegant">
          <VideoIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{L("Mode Vidéo", "Horonan-tsary", "Video")}</h1>
          <p className="text-xs text-muted-foreground">{L("En 5 étapes simples", "Dingana 5 tsotra", "5 simple steps")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <StepCard n={1} title={L("Importer une photo", "Ampidiro ny sary", "Import a photo")} done={!!refImage}>
          <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 cursor-pointer hover:bg-accent/40 transition-smooth">
            {refImage ? (
              <img src={refImage} alt="ref" className="max-h-48 rounded-lg" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{L("Touchez pour choisir", "Kitiho hisafidy", "Tap to choose")}</span>
                <span className="text-[11px] text-muted-foreground/70">PNG, JPG · 10MB</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={busy} />
          </label>
        </StepCard>

        <StepCard n={2} title={L("Catégorie", "Sokajy", "Category")} done={!!category}>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`text-sm px-3 py-3 rounded-xl border-2 transition-smooth text-left font-medium ${category === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                {L(c.fr, c.mg, c.en)}
              </button>
            ))}
          </div>
        </StepCard>

        <StepCard n={3} title={L("Durée", "Fotoana", "Duration")} done>
          <div className="grid grid-cols-2 gap-2">
            {[6, 10].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d as 6 | 10)}
                className={`px-3 py-4 rounded-xl border-2 transition-smooth font-semibold ${duration === d ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                {d}s
              </button>
            ))}
          </div>
        </StepCard>

        <StepCard n={4} title={L("Style", "Endrika", "Style")} done={!!style}>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`text-left px-3 py-3 rounded-xl border-2 transition-smooth ${style === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <div className="text-sm font-semibold">{L(s.fr, s.mg, s.en)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
          {style === "custom" && (
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={L("Décrivez le style vidéo", "Lazao ny endriky ny video", "Describe the video style")}
              className="mt-3"
              rows={3}
              maxLength={500}
            />
          )}
        </StepCard>

        <div className="pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || busy}
            className="w-full h-14 gradient-secondary text-primary-foreground shadow-elegant text-base font-bold rounded-2xl"
          >
            {busy ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {L("Génération en cours...", "Mamorona...", "Generating...")}</>) : (<><Sparkles className="h-5 w-5 mr-2" /> {L("Générer", "Hamorona", "Generate")}</>)}
          </Button>
          {busy && <Progress value={progress} className="h-2 mt-3" />}
        </div>
      </div>
    </div>
  );
}

function StepCard({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? "gradient-secondary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {done ? <Check className="h-3.5 w-3.5" /> : n}
        </div>
        <Label className="text-sm font-semibold">{title}</Label>
      </div>
      {children}
    </div>
  );
}
