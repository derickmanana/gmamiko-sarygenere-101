// Generate a real MP4/WebM video from a still image using canvas animation
// + MediaRecorder. Produces a Ken Burns (zoom/pan) motion clip so the output
// is a genuine playable video file, not a static image.

export interface KenBurnsOpts {
  imageDataUrl: string;
  durationSec: number; // 6 or 10
  size?: number; // square canvas size, default 1024
  fps?: number;
  onProgress?: (pct: number) => void;
}

interface MRWithMime {
  mimeType: string;
  ext: "mp4" | "webm";
}

function pickMime(): MRWithMime {
  const MR = (typeof window !== "undefined" ? window.MediaRecorder : undefined) as
    | (typeof MediaRecorder & { isTypeSupported?: (t: string) => boolean })
    | undefined;
  const candidates: MRWithMime[] = [
    { mimeType: "video/mp4;codecs=avc1.42E01E", ext: "mp4" },
    { mimeType: "video/mp4", ext: "mp4" },
    { mimeType: "video/webm;codecs=vp9", ext: "webm" },
    { mimeType: "video/webm;codecs=vp8", ext: "webm" },
    { mimeType: "video/webm", ext: "webm" },
  ];
  for (const c of candidates) {
    if (MR?.isTypeSupported?.(c.mimeType)) return c;
  }
  return { mimeType: "", ext: "webm" };
}

export async function renderKenBurnsVideo(
  opts: KenBurnsOpts,
): Promise<{ blob: Blob; url: string; ext: "mp4" | "webm" }> {
  const size = opts.size ?? 1024;
  const fps = opts.fps ?? 30;
  const duration = Math.max(1, opts.durationSec);

  const img = await loadImage(opts.imageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) throw new Error("Votre navigateur ne prend pas en charge la génération vidéo (Canvas 2D indisponible). Essayez Chrome ou Samsung Internet à jour.");
  const ctx: CanvasRenderingContext2D = ctx2d;

  const canvasWithCapture = canvas as HTMLCanvasElement & { captureStream?: (fps: number) => MediaStream };
  if (typeof canvasWithCapture.captureStream !== "function" || typeof window.MediaRecorder === "undefined") {
    throw new Error("Votre navigateur ne prend pas en charge l'enregistrement vidéo. Mettez à jour Chrome / Android System WebView (v75+) ou utilisez Samsung Internet.");
  }
  const stream = canvasWithCapture.captureStream(fps);
  const { mimeType, ext } = pickMime();
  const rec = new MediaRecorder(
    stream,
    mimeType ? { mimeType, videoBitsPerSecond: 5_000_000 } : { videoBitsPerSecond: 5_000_000 },
  );

  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const stopped = new Promise<void>((resolve) => {
    rec.onstop = () => resolve();
  });
  rec.start();

  const start = performance.now();
  const totalMs = duration * 1000;

  await new Promise<void>((resolve) => {
    function frame() {
      const now = performance.now();
      const t = Math.min(1, (now - start) / totalMs);
      // Ease-in-out zoom from 1.0 → 1.18 with slight diagonal pan.
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const scale = 1 + 0.18 * eased;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      // Cover the canvas.
      const cover = Math.max(size / iw, size / ih) * scale;
      const w = iw * cover;
      const h = ih * cover;
      const panX = (w - size) * (0.5 - 0.15 * eased);
      const panY = (h - size) * (0.5 - 0.1 * eased);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, -panX, -panY, w, h);

      // Subtle cinematic vignette
      const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.35, size / 2, size / 2, size * 0.7);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      opts.onProgress?.(Math.round(t * 100));
      if (t >= 1) resolve();
      else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  rec.stop();
  await stopped;
  const blob = new Blob(chunks, { type: mimeType || `video/${ext}` });
  const url = URL.createObjectURL(blob);
  return { blob, url, ext };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}
