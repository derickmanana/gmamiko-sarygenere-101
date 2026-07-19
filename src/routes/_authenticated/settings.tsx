import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Locale } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [quality, setQuality] = useState("high");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        if (data.language) setLocale(data.language as Locale);
        if (data.theme) setTheme(data.theme as Theme);
        if (data.image_quality) setQuality(data.image_quality);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("preferences").upsert({
      user_id: user.id,
      language: locale,
      theme,
      image_quality: quality,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t("saved"));
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-up">
      <h1 className="text-3xl font-bold mb-8">{t("settings_title")}</h1>

      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="space-y-2">
          <Label>{t("settings_language")}</Label>
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mg">Malagasy</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("settings_theme")}</Label>
          <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t("theme_light")}</SelectItem>
              <SelectItem value="dark">{t("theme_dark")}</SelectItem>
              <SelectItem value="system">{t("theme_system")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("settings_quality")}</Label>
          <Select value={quality} onValueChange={setQuality}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">{t("quality_standard")}</SelectItem>
              <SelectItem value="high">{t("quality_high")}</SelectItem>
              <SelectItem value="ultra">{t("quality_ultra")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={save} disabled={saving} className="w-full gradient-primary text-primary-foreground shadow-elegant">
          {saving ? "…" : t("save")}
        </Button>
      </div>
    </div>
  );
}
