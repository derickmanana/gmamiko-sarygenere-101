import type { TranslationKey } from "./i18n";
import {
  Shirt,
  Camera,
  Wand2,
  Sparkles,
  Video,
  PenLine,
  ImagePlus,
  Share2,
  Palette,
  LayoutGrid,
  Tags,
  History,
  Download,
  Languages,
  type LucideIcon,
} from "lucide-react";

export interface ModuleDef {
  slug: string;
  name: string;
  descKey: TranslationKey;
  icon: LucideIcon;
  active: boolean;
  gradient: "primary" | "secondary";
}

export const MODULES: ModuleDef[] = [
  { slug: "product-photography", name: "AI Product Photography", descKey: "module_desc_product", icon: Camera, active: true, gradient: "primary" },
  { slug: "fashion", name: "AI Fashion", descKey: "module_desc_fashion", icon: Shirt, active: false, gradient: "secondary" },
  { slug: "background", name: "AI Background Generator", descKey: "module_desc_background", icon: Wand2, active: false, gradient: "primary" },
  { slug: "enhance", name: "AI Image Enhancement", descKey: "module_desc_enhance", icon: Sparkles, active: false, gradient: "secondary" },
  { slug: "video", name: "AI Video Generator", descKey: "module_desc_video", icon: Video, active: false, gradient: "primary" },
  { slug: "writer", name: "AI Marketing Writer", descKey: "module_desc_writer", icon: PenLine, active: false, gradient: "secondary" },
  { slug: "poster", name: "AI Poster Generator", descKey: "module_desc_poster", icon: ImagePlus, active: false, gradient: "primary" },
  { slug: "social", name: "AI Social Media Generator", descKey: "module_desc_social", icon: Share2, active: false, gradient: "secondary" },
  { slug: "branding", name: "AI Branding", descKey: "module_desc_branding", icon: Palette, active: false, gradient: "primary" },
  { slug: "layout", name: "AI Smart Layout", descKey: "module_desc_layout", icon: LayoutGrid, active: false, gradient: "secondary" },
  { slug: "categories", name: "AI Product Categories", descKey: "module_desc_categories", icon: Tags, active: false, gradient: "primary" },
  { slug: "history", name: "AI History", descKey: "module_desc_history", icon: History, active: false, gradient: "secondary" },
  { slug: "export", name: "AI Export HD", descKey: "module_desc_export", icon: Download, active: false, gradient: "primary" },
  { slug: "multilingual", name: "AI Multilingual", descKey: "module_desc_multi", icon: Languages, active: false, gradient: "secondary" },
];
