import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-6 inline-flex rounded-md gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant">
          Go home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ? error.message : "Try refreshing or head back home."}
        </p>
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm">Go home</a>
          <button
            onClick={() => { try { location.reload(); } catch { /* noop */ } }}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#c8102e", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0f1a14", media: "(prefers-color-scheme: dark)" },
      { name: "color-scheme", content: "light dark" },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { title: "GMAMIKO101" },
      { name: "description", content: "GMAMIKO101 est la plateforme IA qui transforme une simple photo produit en visuel ou vidéo publicitaire premium, prête pour les réseaux sociaux et l'e-commerce." },
      { name: "author", content: "GMAMIKO101" },
      { property: "og:title", content: "GMAMIKO101" },
      { property: "og:description", content: "GMAMIKO101 est la plateforme IA qui transforme une simple photo produit en visuel ou vidéo publicitaire premium, prête pour les réseaux sociaux et l'e-commerce." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GMAMIKO101" },
      { name: "twitter:description", content: "GMAMIKO101 est la plateforme IA qui transforme une simple photo produit en visuel ou vidéo publicitaire premium, prête pour les réseaux sociaux et l'e-commerce." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/90abaa22-b128-498a-9b95-3c02ec647d08" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/90abaa22-b128-498a-9b95-3c02ec647d08" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <Outlet />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
