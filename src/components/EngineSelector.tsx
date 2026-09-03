import { Cpu } from "lucide-react";
import { AI_ENGINES, type AiEngine } from "@/lib/engine";
import { useI18n } from "@/lib/i18n";

export function EngineSelector({
  engine,
  setEngine,
  disabled,
}: {
  engine: AiEngine;
  setEngine: (e: AiEngine) => void;
  disabled?: boolean;
}) {
  const { locale } = useI18n();
  const L = (fr: string, mg: string, en: string) => (locale === "mg" ? mg : locale === "en" ? en : fr);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <Cpu className="h-3.5 w-3.5" />
        {L("Moteur IA", "Motera IA", "AI engine")}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {AI_ENGINES.map((e) => (
          <button
            key={e.id}
            type="button"
            disabled={disabled}
            onClick={() => setEngine(e.id)}
            className={`text-left px-3 py-3 rounded-xl border-2 transition-smooth disabled:opacity-60 ${
              engine === e.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <div className="text-sm font-semibold">{e.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {locale === "mg" ? e.desc.mg : locale === "en" ? e.desc.en : e.desc.fr}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
