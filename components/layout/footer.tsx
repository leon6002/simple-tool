import Link from "next/link";
import { Heart, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 backdrop-blur-sm mt-20">
      <div className="container px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              SimpleTool
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modern, free, and open-source online utilities for developers and
              creators.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-purple-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-purple-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-purple-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Built With</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link
                href="https://nextjs.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                Next.js 16
              </Link>
              <Link
                href="https://ui.shadcn.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                shadcn/ui
              </Link>
              <Link
                href="https://tailwindcss.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                Tailwind CSS
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by
            the community
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-purple-600 transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
