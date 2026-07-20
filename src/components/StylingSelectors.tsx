import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import {
  SUBJECTS,
  MORPHOLOGIES,
  ACCESSORIES,
  pickL,
  type Locale,
} from "@/lib/styling";

interface Props {
  locale: Locale;
  autoMode: boolean;
  setAutoMode: (v: boolean) => void;
  subject: string;
  setSubject: (v: string) => void;
  morphology: string;
  setMorphology: (v: string) => void;
  accessories: string[];
  toggleAccessory: (id: string) => void;
  disabled?: boolean;
}

export function StylingSelectors(p: Props) {
  const L = (fr: string, mg: string, en: string) => (p.locale === "mg" ? mg : p.locale === "en" ? en : fr);
  const showHuman = p.subject !== "product";

  return (
    <div className="space-y-4">
      {/* Auto mode master switch */}
      <div className="flex items-center justify-between rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-3 pr-3">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">{L("IA Choix Automatique", "Safidin'ny IA ho azy", "AI Auto Choice")}</p>
            <p className="text-xs text-muted-foreground">
              {L("L'IA choisit tout pour vous", "Mifidy ny zavatra rehetra ho anao ny IA", "AI picks everything")}
            </p>
          </div>
        </div>
        <Switch checked={p.autoMode} onCheckedChange={p.setAutoMode} disabled={p.disabled} />
      </div>

      {!p.autoMode && (
        <>
          <div>
            <Label className="text-sm font-semibold mb-2 block">{L("Type de sujet", "Karazan-javatra", "Subject type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={p.disabled}
                  onClick={() => p.setSubject(s.id)}
                  className={`text-sm px-3 py-3 rounded-xl border-2 transition-smooth text-left font-medium ${p.subject === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  {pickL(p.locale, s.label)}
                </button>
              ))}
            </div>
          </div>

          {showHuman && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">{L("Morphologie", "Bikany", "Morphology")}</Label>
              <div className="flex flex-wrap gap-2">
                {MORPHOLOGIES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={p.disabled}
                    onClick={() => p.setMorphology(m.id)}
                    className={`text-xs px-3 py-2 rounded-full border-2 transition-smooth font-medium ${p.morphology === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    {pickL(p.locale, m.label)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold mb-2 block">
              {L("Accessoires", "Fanaka fanampiny", "Accessories")}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({p.accessories.length || L("aucun — auto", "tsy misy — ho azy", "none — auto")})
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {ACCESSORIES.map((a) => {
                const on = p.accessories.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    disabled={p.disabled}
                    onClick={() => p.toggleAccessory(a.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border-2 transition-smooth ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}
                  >
                    {pickL(p.locale, a.label)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
