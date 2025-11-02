"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolCard } from "@/components/tools/tool-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TOOLS, CATEGORIES } from "@/lib/constants/tools";
import { useSearchStore } from "@/lib/stores/search-store";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import { ToolCategory } from "@/types";
import { Sparkles, Rocket, Search as SearchIcon, Star, Clock } from "lucide-react";

export default function Home() {
  const { query, category } = useSearchStore();
  const { favoriteTools, recentlyUsedTools } = useUserPreferencesStore();
  const [filteredTools, setFilteredTools] = useState(TOOLS);

  useEffect(() => {
    let result = TOOLS;
    
    if (query) {
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (category !== "all") {
      result = result.filter(tool => tool.category === category);
    }
    
    setFilteredTools(result);
  }, [query, category]);

  const favoriteToolsList = TOOLS.filter(tool => favoriteTools.includes(tool.id));
  const recentlyUsedToolsList = TOOLS.filter(tool => recentlyUsedTools.includes(tool.id));

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            SimpleTool
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            A collection of modern, easy-to-use online tools to boost your productivity
          </motion.p>
        </div>

        {/* User Preference Sections */}
        {favoriteToolsList.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Your Favorite Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteToolsList.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {recentlyUsedToolsList.length > 0 && favoriteToolsList.length > 0 && (
          <Separator className="my-12" />
        )}

        {recentlyUsedToolsList.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold">Recently Used</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyUsedToolsList.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {(favoriteToolsList.length > 0 || recentlyUsedToolsList.length > 0) && (
          <Separator className="my-12" />
        )}

        {/* Categories */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.id}
                variant={category === cat.id ? "default" : "secondary"}
                className="cursor-pointer py-2 px-4 text-sm transition-all hover:scale-105"
                onClick={() => useSearchStore.getState().setCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </motion.section>

        {/* Tools Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {filteredTools.length > 0 ? (
              <motion.div 
                key="tools-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <h3 className="text-2xl font-semibold mb-2">No tools found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </motion.div>
    </div>
  );
}
