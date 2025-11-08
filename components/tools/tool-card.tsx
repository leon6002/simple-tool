"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tool } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Star,
  Calculator,
  Image,
  ScanText,
  Box,
  Binary,
  Hash,
  FileJson,
  Key,
  Palette,
  Terminal,
  Scissors,
  FileText,
  Zap,
  Clock,
  Shell,
  GitBranch,
  Server,
  Minimize2,
  Compass,
  Ticket,
  Regex,
  LayoutGrid,
  RefreshCw,
  Shield,
  Code,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { favoriteTools, addFavoriteTool, removeFavoriteTool } =
    useUserPreferencesStore();
  const isFavorite = favoriteTools.includes(tool.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorite) {
      removeFavoriteTool(tool.id);
    } else {
      addFavoriteTool(tool.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={tool.href}
        onClick={() =>
          useUserPreferencesStore.getState().addRecentlyUsedTool(tool.id)
        }
        className="block h-full"
      >
        <div className="h-full flex flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-lg shadow-purple-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
          <div className="flex items-start justify-between mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20">
              {getIconComponent(tool.icon)}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-colors",
                isFavorite
                  ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={toggleFavorite}
            >
              <Star
                className={cn("h-4 w-4", isFavorite ? "fill-current" : "")}
              />
              <span className="sr-only">
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </span>
            </Button>
          </div>

          <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
          <p className="text-muted-foreground mb-4 flex-1">
            {tool.description}
          </p>

          {tool.featured && (
            <Badge className="self-start mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0">
              Featured
            </Badge>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <span>Try it now</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function getIconComponent(icon: string): React.ReactNode {
  const iconMap: Record<string, LucideIcon> = {
    Calculator,
    Image,
    ScanText,
    Box,
    Binary,
    Hash,
    FileJson,
    Key,
    Palette,
    Terminal,
    Scissors,
    FileText,
    Zap,
    Clock,
    Shell,
    GitBranch,
    Server,
    Minimize2,
    Compass,
    Ticket,
    Regex,
    LayoutGrid,
    RefreshCw,
    Shield,
    Code,
    Sparkles,
  };

  const IconComponent = iconMap[icon] || Wrench;
  return <IconComponent className="h-6 w-6 text-purple-600" />;
}
