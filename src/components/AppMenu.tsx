import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, LayoutDashboard, Sparkles, History as HistoryIcon, Settings, LogOut, Store, Crown, Languages, Palette, HelpCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();

  const L = (fr: string, mg: string, en: string) =>
    locale === "mg" ? mg : locale === "en" ? en : fr;

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  }

  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: L("Tableau de bord", "Dashboard", "Dashboard") },
    { to: "/tools", icon: Sparkles, label: L("AI Boutique Identity", "AI Boutique Identity", "AI Boutique Identity"), sub: L("Tous les modules avancés", "Modely mandroso rehetra", "All advanced modules") },
    { to: "/history", icon: HistoryIcon, label: L("Historique", "Tantara", "History") },
    { to: "/settings", icon: Crown, label: L("Premium", "Premium", "Premium") },
    { to: "/settings", icon: SlidersHorizontal, label: L("Préférences", "Safidy", "Preferences") },
    { to: "/settings", icon: Settings, label: L("Paramètres", "Paramètre", "Settings") },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] sm:w-[380px] p-0 flex flex-col">
        <SheetHeader className="px-5 py-5 border-b">
          <SheetTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {user?.email?.[0]?.toUpperCase() ?? "G"}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">GMAMIKO101</span>
              <span className="text-xs text-muted-foreground truncate max-w-[220px]">{user?.email}</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="flex flex-col">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-smooth"
            >
              <Store className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{L("Accueil", "Fandraisana", "Home")}</span>
            </Link>

            {items.map((it) => (
              <Link
                key={it.label}
                to={it.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-smooth"
              >
                <it.icon className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{it.label}</span>
                  {it.sub && <span className="text-[11px] text-muted-foreground">{it.sub}</span>}
                </div>
              </Link>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="px-3 py-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Languages className="h-4 w-4" /> {L("Langue", "Fiteny", "Language")}
              </span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Palette className="h-4 w-4" /> {L("Thème", "Endrika", "Theme")}
              </span>
              <ThemeToggle />
            </div>
          </div>

          <Separator className="my-3" />

          <a
            href="mailto:support@gmamiko101.mg"
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-smooth"
          >
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{L("Aide", "Fanampiana", "Help")}</span>
          </a>
        </nav>

        <div className="border-t p-3">
          <Button variant="ghost" onClick={signOut} className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> {L("Se déconnecter", "Hivoaka", "Sign out")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
