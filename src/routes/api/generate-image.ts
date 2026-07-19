import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

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

        const systemHint =
          "You are producing a premium, e-commerce ready product advertisement image. Clean, high-end lighting, sharp focus, marketing quality.";

        const content: Array<Record<string, unknown>> = [
          { type: "text", text: `${systemHint}\n\nUser request: ${prompt}` },
        ];
        if (body.refImage && typeof body.refImage === "string" && body.refImage.startsWith("data:image/")) {
          content.push({ type: "image_url", image_url: { url: body.refImage } });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
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
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          return new Response(text || "Upstream error", { status: upstream.status });
        }

        return new Response(upstream.body, {
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
