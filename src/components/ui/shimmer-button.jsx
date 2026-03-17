import { cn } from "@/lib/utils";

export function ShimmerButton({
  children,
  className,
  borderRadius = "100px",
  background = "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in oklch, var(--color-primary) 80%, var(--color-secondary, var(--color-primary))) 100%)",
  ...props
}) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 font-semibold text-primary-content transition-colors duration-200 ease-out",
        className
      )}
      style={{
        borderRadius,
        background,
        boxShadow: "0 4px 20px color-mix(in oklch, var(--color-primary) 30%, transparent)",
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
