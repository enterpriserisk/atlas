import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown — renders a playbook entry body with brand-consistent, accessible typography.
 * GitHub-flavored markdown (tables, lists) via remark-gfm. Headings map to h2/h3 so the
 * page's h1 (the entry title) stays the single top-level heading.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-2xl space-y-4 text-um-black-metallic">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-8 text-2xl font-bold text-um-blue">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 text-xl font-bold text-um-blue">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-lg font-semibold text-um-blue">{children}</h3>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-6 leading-relaxed">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-6 leading-relaxed">{children}</ol>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-um-arboretum-blue underline underline-offset-2 hover:text-um-blue"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-um-black-metallic">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-um-maize bg-surface-muted px-4 py-2 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
