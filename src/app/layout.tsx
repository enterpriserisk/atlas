import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "ATLAS — U-M Enterprise Risk Management AI Playbook",
    template: "%s · ATLAS",
  },
  description:
    "ATLAS (Actionable Tooling, Libraries, Automation & Standards) — a living resource from the University of Michigan Enterprise Risk Management to help staff use AI effectively, consistently, and responsibly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AccessibilityProvider>
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
