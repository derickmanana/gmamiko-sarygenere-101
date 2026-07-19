import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-elegant">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        <span className="text-gradient-primary">GMAMIKO</span>
        <span className="text-secondary">101</span>
      </span>
    </div>
  );
}
