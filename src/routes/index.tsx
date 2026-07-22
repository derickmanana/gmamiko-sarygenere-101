import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Video } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { locale } = useI18n();
  const { user } = useAuth();

  const welcome =
    locale === "fr"
      ? "Tongasoa eto amin'ny GMAMIKO101"
      : locale === "en"
      ? "Tongasoa eto amin'ny GMAMIKO101 — Welcome"
      : "Tongasoa eto amin'ny GMAMIKO101";

  const subtitle =
    locale === "fr"
      ? "Créez une publicité pro en quelques secondes."
      : locale === "en"
      ? "Create a pro-grade ad in seconds."
      : "Mamorona dokam-barotra tsara tarehy an-tsegondra vitsy.";

  // If logged in → go straight to create flows. Otherwise send to auth.
  const photoTo = user ? "/create/photo" : "/auth";
  const videoTo = user ? "/create/video" : "/auth";

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between gap-2 px-3 sm:px-8 py-3 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xl sm:text-2xl shrink-0" aria-hidden>🇲🇬</span>
          <span className="font-display text-base sm:text-xl font-bold tracking-tight truncate">
            <span className="text-gradient-primary">GMAMIKO</span>
            <span className="text-secondary">101</span>
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-10 sm:pb-16 text-center animate-fade-up">
        <div className="text-5xl sm:text-7xl mb-3 sm:mb-4" aria-hidden>🇲🇬</div>
        <h1 className="font-display text-3xl sm:text-6xl font-bold tracking-tight">
          <span className="text-gradient-primary">GMAMIKO</span>
          <span className="text-secondary">101</span>
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-2xl font-medium text-foreground max-w-xl px-2">
          {welcome}
        </p>
        <p className="mt-2 text-xs sm:text-base text-muted-foreground max-w-md px-2">
          {subtitle}
        </p>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl">
          <Link
            to={photoTo}
            search={user ? undefined : { mode: "signup" }}
            className="group relative overflow-hidden rounded-3xl gradient-primary p-6 sm:p-10 shadow-elegant hover:shadow-glow transition-smooth hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4 text-primary-foreground">
              <Camera className="h-12 w-12 sm:h-16 sm:w-16" strokeWidth={1.5} />
              <span className="text-xl sm:text-3xl font-bold tracking-tight">📸 PHOTO</span>
            </div>
          </Link>

          <Link
            to={videoTo}
            search={user ? undefined : { mode: "signup" }}
            className="group relative overflow-hidden rounded-3xl gradient-secondary p-6 sm:p-10 shadow-elegant hover:shadow-glow transition-smooth hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4 text-primary-foreground">
              <Video className="h-12 w-12 sm:h-16 sm:w-16" strokeWidth={1.5} />
              <span className="text-xl sm:text-3xl font-bold tracking-tight">🎥 VIDÉO</span>
            </div>
          </Link>
        </div>

        <div className="mt-8 sm:mt-12 h-1.5 w-32 sm:w-40 rounded-full gradient-flag" />
      </main>
    </div>
  );
}
