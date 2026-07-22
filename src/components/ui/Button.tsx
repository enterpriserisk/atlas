import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Button — brand-safe, accessible action element.
 *
 * Variants use only approved contrast pairings (see lib/colors.ts):
 * - primary:   Michigan Blue bg / white text
 * - maize:     Maize bg / Blue text  (the ONLY safe maize combo — never white on maize)
 * - secondary: white bg / Blue text, Blue border
 * - ghost:     transparent bg / Blue text
 *
 * Renders as <a> (via next/link) when `href` is provided, otherwise <button>.
 */

type Variant = "primary" | "maize" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-um-blue text-white hover:bg-[#00396f] focus-visible:outline-um-maize",
  maize:
    "bg-um-maize text-um-blue hover:bg-[#ffd633] focus-visible:outline-um-blue",
  secondary:
    "border border-um-blue bg-white text-um-blue hover:bg-surface-muted focus-visible:outline-um-blue",
  ghost:
    "bg-transparent text-um-blue hover:bg-surface-muted focus-visible:outline-um-blue",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    void _v;
    void _s;
    void _c;
    void _ch;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } = props;
  void _v;
  void _s;
  void _c;
  void _ch;
  void _h;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
