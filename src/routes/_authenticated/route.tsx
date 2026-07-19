import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Sparkles, History as HistoryIcon, Settings, LogOut, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "login" } });
    return { user: data.user };
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard"><Logo /></Link>
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" icon={LayoutDashboard} label={t("nav_dashboard")} />
              <NavLink to="/tools" icon={Sparkles} label={t("nav_tools")} />
              <NavLink to="/history" icon={HistoryIcon} label={t("nav_history")} />
              <NavLink to="/settings" icon={Settings} label={t("nav_settings")} />
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full gradient-primary text-primary-foreground">
                  <UserIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user?.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/settings">{t("nav_settings")}</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> {t("nav_logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden border-t px-2 py-2 flex items-center justify-around">
          <NavLink to="/dashboard" icon={LayoutDashboard} label={t("nav_dashboard")} compact />
          <NavLink to="/tools" icon={Sparkles} label={t("nav_tools")} compact />
          <NavLink to="/history" icon={HistoryIcon} label={t("nav_history")} compact />
          <NavLink to="/settings" icon={Settings} label={t("nav_settings")} compact />
        </nav>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}

function NavLink({ to, icon: Icon, label, compact = false }: { to: string; icon: typeof LayoutDashboard; label: string; compact?: boolean }) {
  return (
    <Link
      to={to}
      className="flex flex-col md:flex-row items-center gap-1 md:gap-2 rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
      activeProps={{ className: "bg-accent text-foreground" }}
    >
      <Icon className="h-4 w-4" />
      {!compact && <span className="hidden md:inline">{label}</span>}
      {compact && <span className="text-[10px]">{label}</span>}
    </Link>
  );
}
