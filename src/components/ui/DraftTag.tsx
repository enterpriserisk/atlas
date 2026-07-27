import { cn } from "@/lib/cn";

/**
 * DraftTag — visible "Draft — pending ERM review" flag for placeholder content that
 * subject-matter experts must finalize. Made a component so it can be toggled off
 * globally once content is approved (search for DraftTag usages).
 */
export function DraftTag({ className, label = "Draft — pending ERM review" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-um-ross-orange bg-[#fbe9dc] px-2.5 py-0.5 text-xs font-semibold text-[#7a3406]",
        className,
      )}
    >
      <span aria-hidden="true">✎</span>
      {label}
    </span>
  );
}
