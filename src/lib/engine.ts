import { useCallback, useEffect, useState } from "react";

export type AiEngine = "gemini" | "openai";

export const AI_ENGINES: { id: AiEngine; label: string; desc: { fr: string; mg: string; en: string } }[] = [
  {
    id: "gemini",
    label: "Gemini",
    desc: {
      fr: "Rapide, aperçu progressif",
      mg: "Haingana, misy topi-maso",
      en: "Fast, live preview",
    },
  },
  {
    id: "openai",
    label: "OpenAI",
    desc: {
      fr: "Rendu très détaillé",
      mg: "Sary tena madio",
      en: "Highly detailed output",
    },
  },
];

const KEY = "gmamiko101:ai-engine";

export function useAiEngine() {
  const [engine, setEngineState] = useState<AiEngine>("gemini");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "gemini" || saved === "openai") setEngineState(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setEngine = useCallback((next: AiEngine) => {
    setEngineState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { engine, setEngine };
}
