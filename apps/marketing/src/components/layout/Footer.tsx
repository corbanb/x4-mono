import Link from "next/link";
import { Github, Twitter } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3003";

const FOOTER_SECTIONS = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/stack", label: "Stack" },
    { href: "/ai", label: "AI" },
  ],
  Resources: [
    { href: DOCS_URL, label: "Documentation", external: true },
    { href: `${DOCS_URL}/api`, label: "API Reference", external: true },
    { href: "/docs", label: "Quick Start" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "https://github.com/corbanb/x4-mono", label: "GitHub", external: true },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="gradient-text text-2xl font-bold">
              x4
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Ship web, mobile, and desktop apps from a single TypeScript
              codebase.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://github.com/corbanb/x4-mono"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Link sections */}
          {Object.entries(FOOTER_SECTIONS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">
                {category}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} x4. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href={`${APP_URL}/login`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </a>
            <a
              href={`${APP_URL}/signup`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
