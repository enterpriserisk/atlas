import { cn } from "@/lib/cn";

/**
 * PageHeader — consistent page title block with an optional eyebrow, description,
 * and trailing actions/aside. Renders a proper <h1> for heading order.
 */
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("border-b border-border-subtle bg-surface-muted", className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wide text-um-arboretum-blue">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-um-blue sm:text-4xl">
            {title}
          </h1>
          {description && (
            <div className="mt-3 text-base leading-relaxed text-um-black-metallic">
              {description}
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
