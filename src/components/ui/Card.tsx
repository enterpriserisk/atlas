import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Card — surface primitive with consistent border, radius, padding, and shadow.
 * When `href` is provided the whole card becomes an accessible link with hover/focus affordance.
 */

interface CardProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  /** Visual emphasis via a colored left accent bar (uses a brand token class, e.g. "bg-um-maize"). */
  accent?: string;
  /** Optional DOM id, e.g. for in-page anchor links (#tool-id). */
  id?: string;
}

const surface =
  "relative overflow-hidden rounded-lg border border-border-subtle bg-white shadow-sm";

export function Card({ href, className, children, accent, id }: CardProps) {
  const interactive = href
    ? "block transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
    : "";
  const content = (
    <>
      {accent && <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", accent)} />}
      <div className={cn(accent && "pl-1.5")}>{children}</div>
    </>
  );

  if (href) {
    return (
      <Link id={id} href={href} className={cn(surface, interactive, className)}>
        {content}
      </Link>
    );
  }
  return (
    <div id={id} className={cn(surface, className)}>
      {content}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardTitle({
  as: Tag = "h3",
  className,
  children,
}: {
  as?: "h2" | "h3" | "h4";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("text-lg font-semibold text-um-blue", className)}>{children}</Tag>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <p className={cn("mt-1 text-sm leading-relaxed text-um-black-metallic", className)}>{children}</p>;
}
