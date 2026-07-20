// Shared styling knowledge for Photo & Video AI generation.
// Prompt engineering happens here so both flows stay consistent.

export type Locale = "fr" | "mg" | "en";
export type Tri = { fr: string; mg: string; en: string };

export const pickL = (locale: Locale, t: Tri) => t[locale] ?? t.fr;

export interface Option {
  id: string;
  label: Tri;
  prompt: string;
}

export const SUBJECTS: Option[] = [
  { id: "woman", label: { fr: "Femme", mg: "Vehivavy", en: "Woman" }, prompt: "adult female model, natural elegant pose" },
  { id: "man", label: { fr: "Homme", mg: "Lehilahy", en: "Man" }, prompt: "adult male model, confident pose" },
  { id: "child", label: { fr: "Enfant", mg: "Ankizy", en: "Child" }, prompt: "child model, playful natural pose, age-appropriate styling" },
  { id: "baby", label: { fr: "Bébé", mg: "Zaza", en: "Baby" }, prompt: "baby model, soft safe pose, tender lighting" },
  { id: "product", label: { fr: "Produit / Objet", mg: "Vokatra", en: "Product / Object" }, prompt: "standalone product hero shot, no human model" },
];

export const MORPHOLOGIES: Option[] = [
  { id: "slim", label: { fr: "Taille fine", mg: "Manify", en: "Slim" }, prompt: "slim slender body proportions" },
  { id: "normal", label: { fr: "Silhouette normale", mg: "Antonony", en: "Normal" }, prompt: "average natural body proportions" },
  { id: "athletic", label: { fr: "Sportif·ve", mg: "Atleta", en: "Athletic" }, prompt: "toned athletic body, sporty posture" },
  { id: "model", label: { fr: "Mannequin", mg: "Mannequin", en: "Model" }, prompt: "high-fashion runway model proportions, editorial posture" },
  { id: "plus", label: { fr: "Grande taille", mg: "Vaventy", en: "Plus size" }, prompt: "confident plus-size body proportions, flattering styling" },
  { id: "muscular", label: { fr: "Musclé·e", mg: "Matanjaka", en: "Muscular" }, prompt: "muscular strong physique" },
  { id: "natural", label: { fr: "Naturel·le", mg: "Voajanahary", en: "Natural" }, prompt: "natural realistic body, unretouched look" },
];

export const ACCESSORIES: Option[] = [
  { id: "glasses", label: { fr: "Lunettes", mg: "Solomaso", en: "Glasses" }, prompt: "stylish glasses" },
  { id: "bag", label: { fr: "Sac", mg: "Kitapo", en: "Bag" }, prompt: "designer handbag" },
  { id: "shoes", label: { fr: "Chaussures", mg: "Kiraro", en: "Shoes" }, prompt: "matching shoes" },
  { id: "heels", label: { fr: "Talons", mg: "Talon avo", en: "Heels" }, prompt: "elegant high heels" },
  { id: "sandals", label: { fr: "Sandales", mg: "Kapa", en: "Sandals" }, prompt: "sandals" },
  { id: "kapa", label: { fr: "Kapa", mg: "Kapa", en: "Flip-flops" }, prompt: "kapa flip-flops" },
  { id: "suit", label: { fr: "Costume", mg: "Akanjo ofisialy", en: "Suit" }, prompt: "tailored suit" },
  { id: "tuxedo", label: { fr: "Costard", mg: "Costard", en: "Tuxedo" }, prompt: "sharp tuxedo" },
  { id: "tie", label: { fr: "Cravate", mg: "Kravaty", en: "Tie" }, prompt: "silk tie" },
  { id: "belt", label: { fr: "Ceinture", mg: "Fehikibo", en: "Belt" }, prompt: "leather belt" },
  { id: "hat", label: { fr: "Chapeau", mg: "Satroka", en: "Hat" }, prompt: "elegant hat" },
  { id: "cap", label: { fr: "Casquette", mg: "Satroka kely", en: "Cap" }, prompt: "cap" },
  { id: "watch", label: { fr: "Montre", mg: "Famantaranandro", en: "Watch" }, prompt: "luxury wristwatch" },
  { id: "bracelet", label: { fr: "Bracelet", mg: "Rojo", en: "Bracelet" }, prompt: "bracelet" },
  { id: "necklace", label: { fr: "Collier", mg: "Rojo vozona", en: "Necklace" }, prompt: "delicate necklace" },
  { id: "earrings", label: { fr: "Boucles d'oreilles", mg: "Kavina", en: "Earrings" }, prompt: "earrings" },
  { id: "ring", label: { fr: "Bague", mg: "Peratra", en: "Ring" }, prompt: "ring" },
  { id: "perfume", label: { fr: "Parfum", mg: "Menaka manitra", en: "Perfume" }, prompt: "perfume bottle prop" },
  { id: "scarf", label: { fr: "Écharpe", mg: "Salobonana", en: "Scarf" }, prompt: "scarf" },
];

// Category-based automatic accessory picks (smart association).
const AUTO_BY_CATEGORY: Record<string, string[]> = {
  fashion: ["bag", "heels", "earrings", "necklace"],
  beauty: ["earrings", "necklace"],
  jewelry: [],
  electronics: [],
  home: [],
  food: [],
  other: [],
};
// Refine by subject.
export function autoAccessories(category: string, subject: string): string[] {
  const base = AUTO_BY_CATEGORY[category] ?? [];
  if (subject === "man") {
    if (category === "fashion") return ["shoes", "watch", "belt", "tie"];
    return base.filter((a) => !["heels", "earrings", "necklace"].includes(a));
  }
  if (subject === "child" || subject === "baby") return [];
  if (subject === "product") return [];
  return base;
}

export interface StylingInput {
  category: string; // english id (fashion, food, ...)
  subject: string;
  morphology: string;
  accessories: string[];
  keepFace: boolean;
  autoMode: boolean; // full AI auto — ignore user selectors
}

export function buildStylingPrompt(i: StylingInput, base: string): string {
  if (i.autoMode) {
    return [
      base,
      `${i.category} product`,
      "AI selects the ideal model, morphology, accessories, decor, lighting, palette and pose",
      "harmonious color palette using color-theory principles",
      "premium advertising visual, magazine quality, sharp focus, high resolution",
      "preserve the original product exactly: logo, patterns, color, texture and fine details unchanged",
    ].filter(Boolean).join(", ");
  }

  const subj = SUBJECTS.find((s) => s.id === i.subject);
  const morph = MORPHOLOGIES.find((m) => m.id === i.morphology);
  const accIds = i.accessories.length
    ? i.accessories
    : autoAccessories(i.category, i.subject);
  const accPrompt = accIds
    .map((id) => ACCESSORIES.find((a) => a.id === id)?.prompt)
    .filter(Boolean)
    .join(", ");

  const humanBlock = subj && i.subject !== "product"
    ? [subj.prompt, morph?.prompt, i.keepFace ? "preserve the original face identity and features intact" : ""].filter(Boolean).join(", ")
    : subj?.prompt ?? "";

  return [
    base,
    `${i.category} product`,
    humanBlock,
    accPrompt ? `styled with ${accPrompt}, naturally integrated without hiding the main product` : "",
    "harmonious color palette derived from the product colors, professional colorimetry",
    "preserve the original product exactly: logo, patterns, color, texture and fine details unchanged",
    "premium advertising visual, sharp focus, high resolution, magazine quality",
  ].filter(Boolean).join(", ");
}
