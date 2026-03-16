import { cn } from "@/lib/utils";

export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(255, 255, 255, 0.15)",
  shimmerSize = "0.1em",
  borderRadius = "100px",
  shimmerDuration = "2.5s",
  background = "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in oklch, var(--color-primary) 80%, var(--color-secondary, var(--color-primary))) 100%)",
  ...props
}) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 font-semibold text-primary-content transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl active:scale-95",
        className
      )}
      style={{
        borderRadius,
        background,
        boxShadow: "0 4px 20px color-mix(in oklch, var(--color-primary) 30%, transparent)",
      }}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-0 shimmer-sweep"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          }}
        />
      </div>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
