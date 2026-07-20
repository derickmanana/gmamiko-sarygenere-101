import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Download, Upload, Sparkles, Share2, Video as VideoIcon, Check } from "lucide-react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { StylingSelectors } from "@/components/StylingSelectors";
import { buildStylingPrompt } from "@/lib/styling";
import { renderKenBurnsVideo } from "@/lib/ken-burns-video";

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

function CreateVideo() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const L = (fr: string, mg: string, en: string) => (locale === "mg" ? mg : locale === "en" ? en : fr);

  const [refImage, setRefImage] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [duration, setDuration] = useState<6 | 10>(6);
  const [autoMode, setAutoMode] = useState(true);
  const [subject, setSubject] = useState<string>("woman");
  const [morphology, setMorphology] = useState<string>("normal");
  const [accessories, setAccessories] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"" | "image" | "video">("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExt, setVideoExt] = useState<"mp4" | "webm">("mp4");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const toggleAccessory = (id: string) =>
    setAccessories((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error(L("Image trop grande", "Sary lehibe loatra", "Image too large"));
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(f);
  }

  function buildPrompt() {
    const base = `cinematic ${duration}s advertising video keyframe, dynamic camera-ready composition, smooth motion, professional lighting`;
    return buildStylingPrompt(
      { category, subject, morphology, accessories, keepFace: false, autoMode },
      base,
    );
  }

  async function handleGenerate() {
    if (!refImage || !category || busy) return;

    setBusy(true); setProgress(5); setVideoUrl(null); setPreviewImg(null); setPhase("image");
    try {
      // Step 1: generate the hero frame via the streaming image endpoint.
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(), refImage, module: "video" }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text().catch(() => "Error"));

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = ""; let frameCount = 0; let finalDataUrl: string | null = null;
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
              setPreviewImg(dataUrl);
              setProgress(final ? 55 : Math.min(50, 10 + frameCount * 8));
            });
            if (final) finalDataUrl = dataUrl;
          } catch { /* ignore */ }
        }
      }
      if (!finalDataUrl) throw new Error(L("Échec de la génération de l'image", "Tsy nety", "Image failed"));

      // Step 2: turn the still into a real animated MP4/WebM video.
      setPhase("video");
      const { blob, url, ext } = await renderKenBurnsVideo({
        imageDataUrl: finalDataUrl,
        durationSec: duration,
        onProgress: (p) => setProgress(55 + Math.round(p * 0.45)),
      });
      if (blob.size < 1000) throw new Error(L("Enregistrement vidéo impossible sur cet appareil", "Tsy afaka mamokatra video", "Video encoding unsupported"));

      setVideoUrl(url);
      setVideoExt(ext);
      setProgress(100);

      await supabase.from("generations").insert({
        user_id: user!.id,
        module: "video",
        prompt: buildPrompt(),
        result_type: "video",
        result_url: null,
        status: "completed",
        metadata: { duration, ext },
      });
      toast.success(L("Vidéo prête", "Vita ny video", "Video ready"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
      setPhase("");
    }
  }

  function downloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `gmamiko101-video-${duration}s-${Date.now()}.${videoExt}`;
    a.click();
  }

  async function shareVideo() {
    if (!videoUrl) return;
    try {
      const blob = await (await fetch(videoUrl)).blob();
      const file = new File([blob], `gmamiko101.${videoExt}`, { type: blob.type || `video/${videoExt}` });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "GMAMIKO101", text: "Créé avec GMAMIKO101 🇲🇬" });
      } else {
        downloadVideo();
      }
    } catch { /* cancelled */ }
  }

  function reset() {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null); setPreviewImg(null); setProgress(0);
  }

  if (videoUrl) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 animate-fade-up">
        <div className="rounded-3xl overflow-hidden border shadow-elegant bg-black relative">
          <video src={videoUrl} controls autoPlay loop playsInline className="w-full aspect-square object-cover" />
          <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs text-white font-medium">
            🎥 {duration}s · {videoExt.toUpperCase()}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Button onClick={downloadVideo} size="lg" className="h-14 gradient-primary text-primary-foreground shadow-elegant text-base font-semibold">
            <Download className="h-5 w-5 mr-2" /> {L("Télécharger", "Alaivo", "Download")}
          </Button>
          <Button onClick={shareVideo} size="lg" variant="outline" className="h-14 text-base font-semibold border-2">
            <Share2 className="h-5 w-5 mr-2" /> {L("Partager", "Zarao", "Share")}
          </Button>
        </div>
        <Button onClick={reset} variant="ghost" className="w-full mt-3">
          <Sparkles className="h-4 w-4 mr-2" /> {L("Nouvelle création", "Vaovao", "New creation")}
        </Button>
      </div>
    );
  }

  const canGenerate = refImage && category;

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
          <p className="text-xs text-muted-foreground">{L("Vidéo animée cinématique", "Video mihetsika", "Cinematic animated video")}</p>
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

        <StepCard n={4} title={L("Sujet & Style IA", "IA & endrika", "Subject & AI styling")} done>
          <StylingSelectors
            locale={locale}
            autoMode={autoMode}
            setAutoMode={setAutoMode}
            subject={subject}
            setSubject={setSubject}
            morphology={morphology}
            setMorphology={setMorphology}
            accessories={accessories}
            toggleAccessory={toggleAccessory}
            disabled={busy}
          />
        </StepCard>

        <div className="pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || busy}
            className="w-full h-14 gradient-secondary text-primary-foreground shadow-elegant text-base font-bold rounded-2xl"
          >
            {busy ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {phase === "video" ? L("Rendu vidéo...", "Mamokatra video...", "Rendering video...") : L("Génération...", "Mamorona...", "Generating...")}</>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> {L("Générer la vidéo", "Hamorona video", "Generate video")}</>
            )}
          </Button>
          {busy && (
            <div className="mt-3 space-y-2">
              <Progress value={progress} className="h-2" />
              {previewImg && (
                <div className="rounded-xl overflow-hidden border">
                  <img src={previewImg} alt="preview" className={`w-full aspect-square object-cover ${phase === "image" ? "blur-xl" : ""}`} />
                </div>
              )}
            </div>
          )}
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
