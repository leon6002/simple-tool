"use client";

import { motion } from "framer-motion";
import { ToolCard } from "@/components/tools/tool-card";
import { Badge } from "@/components/ui/badge";
import { TOOLS, CATEGORIES } from "@/lib/constants/tools";
import { useSearchStore } from "@/lib/stores/search-store";
import { ToolCategory } from "@/types";
import {
  Sparkles,
  Rocket,
  Search as SearchIcon,
  LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";

export default function Home() {
  const { query, category, setCategory } = useSearchStore();

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto max-w-7xl py-12 md:py-16 lg:py-24 px-4 md:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl text-center mb-16 md:mb-20"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-4 py-2 text-sm font-medium text-foreground border border-purple-500/20"
        >
          <Sparkles className="h-4 w-4 text-purple-600" />
          Free & Open Source Tools
        </motion.div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Modern Online Tools
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A collection of powerful, easy-to-use utilities for developers and
          creators. Fast, secure, and completely free.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 mb-16"
      >
        {CATEGORIES.map((cat, index) => {
          const IconComponent = (Icons as any)[cat.icon] as LucideIcon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            >
              <Badge
                variant={category === cat.id ? "default" : "outline"}
                className={`cursor-pointer px-5 py-2.5 text-sm font-medium transition-all hover:scale-105 hover:shadow-lg ${
                  category === cat.id
                    ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                    : "hover:border-purple-500/50 hover:bg-purple-500/5"
                }`}
                onClick={() => setCategory(cat.id as ToolCategory)}
              >
                {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                {cat.name}
              </Badge>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-20"
        >
          {filteredTools.map((tool) => (
            <motion.div key={tool.id} variants={item}>
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="mx-auto max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <SearchIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">No tools found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        </motion.div>
      )}

      {/* Featured Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-24 text-center"
      >
        <div className="mx-auto max-w-2xl rounded-3xl border border-border/50 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 p-12 backdrop-blur-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
              <Rocket className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            More tools coming soon!
          </h2>
          <p className="text-lg text-muted-foreground">
            We're constantly adding new utilities to help you work more
            efficiently. Stay tuned for updates!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
