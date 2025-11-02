"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/lib/stores/search-store";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { query, setQuery } = useSearchStore();
  const { addToSearchHistory } = useUserPreferencesStore();
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(localQuery);
    if (localQuery.trim()) {
      addToSearchHistory(localQuery.trim());
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                SimpleTool
              </span>
            </motion.div>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center px-8 max-w-2xl">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools..."
              className="h-11 pl-11 pr-4 rounded-full border-border/50 bg-muted/50 backdrop-blur-sm transition-all focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-10 w-10 rounded-full hover:bg-muted cursor-pointer"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}