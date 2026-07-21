import { createFileRoute } from "@tanstack/react-router";

// 90s max — Gemini image gen can take a while, but we don't want zombie streams.
const UPSTREAM_TIMEOUT_MS = 90_000;

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI service not configured", { status: 503 });

        let body: { prompt?: string; refImage?: string | null; module?: string };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const prompt = (body.prompt ?? "").trim();
        if (!prompt || prompt.length > 2000) {
          return new Response("Invalid prompt", { status: 400 });
        }
        // Guard against oversized data URLs (base64 ~= 1.37x raw bytes).
        if (body.refImage && typeof body.refImage === "string" && body.refImage.length > 15_000_000) {
          return new Response("Reference image too large", { status: 413 });
        }

        const systemHint =
          "You are producing a premium, e-commerce ready product advertisement image. Clean, high-end lighting, sharp focus, marketing quality. Never alter the product's logo, patterns, colors or textures.";

        const content: Array<Record<string, unknown>> = [
          { type: "text", text: `${systemHint}\n\nUser request: ${prompt}` },
        ];
        if (body.refImage && typeof body.refImage === "string" && body.refImage.startsWith("data:image/")) {
          content.push({ type: "image_url", image_url: { url: body.refImage } });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
        // Abort upstream if the browser disconnects.
        request.signal?.addEventListener("abort", () => controller.abort(), { once: true });

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-pro-image",
              messages: [{ role: "user", content }],
              modalities: ["image", "text"],
              stream: true,
            }),
            signal: controller.signal,
          });
        } catch (err) {
          clearTimeout(timeout);
          const aborted = err instanceof Error && err.name === "AbortError";
          return new Response(aborted ? "AI request timed out" : "AI service unreachable", {
            status: aborted ? 504 : 502,
          });
        }

        if (!upstream.ok || !upstream.body) {
          clearTimeout(timeout);
          const text = await upstream.text().catch(() => "");
          if (upstream.status === 429) {
            return new Response("Rate limit — please retry shortly.", { status: 429 });
          }
          if (upstream.status === 402) {
            return new Response("AI credits exhausted — please add credits.", { status: 402 });
          }
          return new Response(text || "Upstream error", { status: upstream.status });
        }

        // Clear the timeout when the stream ends; the body pipe keeps its own lifecycle.
        const stream = new ReadableStream({
          async start(ctrl) {
            const reader = upstream.body!.getReader();
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                ctrl.enqueue(value);
              }
              ctrl.close();
            } catch (err) {
              ctrl.error(err);
            } finally {
              clearTimeout(timeout);
            }
          },
          cancel() {
            controller.abort();
            clearTimeout(timeout);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
