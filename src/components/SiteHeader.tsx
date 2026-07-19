import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="transition-smooth hover:opacity-80">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="gradient-primary text-primary-foreground shadow-elegant">
              <Link to="/dashboard">{t("cta_dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ mode: "login" }}>{t("cta_login")}</Link>
              </Button>
              <Button asChild size="sm" className="gradient-primary text-primary-foreground shadow-elegant">
                <Link to="/auth" search={{ mode: "signup" }}>{t("cta_signup")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
