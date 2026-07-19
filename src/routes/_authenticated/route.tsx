import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppMenu } from "@/components/AppMenu";

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
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <span className="text-xl" aria-hidden>🇲🇬</span>
            <span className="font-display text-base font-bold tracking-tight">
              <span className="text-gradient-primary">GMAMIKO</span>
              <span className="text-secondary">101</span>
            </span>
          </Link>
          <AppMenu />
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
