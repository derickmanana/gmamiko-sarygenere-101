import { Languages } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LABELS: Record<Locale, string> = { mg: "Malagasy", fr: "Français", en: "English" };

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{LABELS[locale]}</span>
          <span className="sm:hidden uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(LABELS) as Locale[]).map((l) => (
          <DropdownMenuItem key={l} onClick={() => setLocale(l)} className={locale === l ? "font-semibold" : ""}>
            {LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
