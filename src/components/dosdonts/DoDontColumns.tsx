import { cn } from "@/lib/cn";

/**
 * DoDontColumns — side-by-side Do / Don't lists for a Do's-and-Don'ts section.
 *
 * Accessibility: meaning is conveyed by MORE than color — each column has a distinct
 * heading ("Do" / "Don't"), a distinct icon (✓ / ✕), and a distinct left-border pattern
 * (solid green vs. dashed red), so the distinction survives for colorblind users and in
 * grayscale (WCAG 1.4.1). Collapses to a single column on mobile.
 */

interface Props {
  dos: string[];
  donts: string[];
}

export function DoDontColumns({ dos, donts }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DoDontList
        variant="do"
        heading="Do"
        icon="✓"
        items={dos}
        className="border-l-4 border-solid border-[#2f7a4d] bg-[#eef6f0]"
        iconClass="text-[#2f7a4d]"
      />
      <DoDontList
        variant="dont"
        heading="Don't"
        icon="✕"
        items={donts}
        className="border-l-4 border-dashed border-um-tappan-red bg-[#f9ecea]"
        iconClass="text-um-tappan-red"
      />
    </div>
  );
}

function DoDontList({
  heading,
  icon,
  items,
  className,
  iconClass,
}: {
  variant: "do" | "dont";
  heading: string;
  icon: string;
  items: string[];
  className: string;
  iconClass: string;
}) {
  return (
    <section className={cn("rounded-md p-4", className)} aria-label={`${heading} list`}>
      <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-um-black-metallic">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white text-sm font-bold",
            iconClass,
          )}
        >
          {icon}
        </span>
        {heading}
      </h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-um-black-metallic">
            <span aria-hidden="true" className={cn("mt-0.5 shrink-0 font-bold", iconClass)}>
              {icon}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
