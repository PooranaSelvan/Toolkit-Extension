import { cn } from "@/lib/utils";

export function AnimatedGradientText({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex animate-gradient-shift bg-[length:200%_auto] bg-clip-text text-transparent",
        "bg-gradient-to-r from-primary via-secondary to-primary",
        className
      )}
    >
      {children}
    </span>
  );
}
