"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useCommands } from "@/hooks/useCommands";
import CommandSkeleton from "@/components/skeletons/command/command-skeleton";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { CommandCard } from "./CommandCard";
import { Command, CommandCategory, Template } from "@/types";
import SearchCard from "../SearchCard";
import { Header } from "../Header";
import { EmptyCard } from "./EmptyCard";
import { TemplateCard } from "../TemplateCard";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface CommandCheatsheetProps {
  id: string;
}

const ITEMS_PER_PAGE = 20; // 每页显示的项目数

export const CommandCheatsheet = (props: CommandCheatsheetProps) => {
  const { data, loading, error } = useCommands(props.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const { addRecentlyUsedTool } = useUserPreferencesStore();
  const { copyToClipboard } = useCopyToClipboard();

  // 记录最近使用的工具
  useEffect(() => {
    addRecentlyUsedTool(`${props.id}-cheatsheet`);
  }, [addRecentlyUsedTool, props.id]);

  // 使用 useMemo 优化过滤逻辑
  const filteredCommands = useMemo(
    () =>
      data?.commands.filter((command: Command) => {
        const matchesSearch =
          command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          command.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
          command.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || command.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }) || [],
    [data?.commands, searchQuery, selectedCategory]
  );

  const filteredTemplate = useMemo(
    () =>
      data?.templates.filter((template: Template) => {
        const matchesSearch =
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || template.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }) || [],
    [data?.templates, searchQuery, selectedCategory]
  );

  // 合并 commands 和 templates 为一个数组
  const allItems = useMemo(
    () => [...filteredCommands, ...filteredTemplate],
    [filteredCommands, filteredTemplate]
  );

  // 当搜索或分类变化时,重置显示数量
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory]);

  // 获取当前显示的项目
  const displayedItems = useMemo(
    () => allItems.slice(0, displayCount),
    [allItems, displayCount]
  );

  const hasMore = displayCount < allItems.length;

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, allItems.length));
  };

  if (loading) return <CommandSkeleton />;

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error}
      </div>
    );
  }

  const tempateCategories = data.categories.filter(
    (category: CommandCategory) => category.type === "template"
  );
  console.log("template category: ", tempateCategories);
  const commandCategories = data.categories.filter(
    (category: CommandCategory) => category.type === "command"
  );

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text, {
      successMessage: "Copied to clipboard! 📋",
    });
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header
          title={data.title}
          description={data.description}
          iconName={data.icon}
        />

        {/* Search and Filter Section */}
        <SearchCard
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          commandCategories={commandCategories}
          tempateCategories={tempateCategories}
        />

        {/* Commands List - Lazy Loading */}
        {allItems.length === 0 ? (
          <EmptyCard />
        ) : (
          <>
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              <AnimatePresence>
                {displayedItems.map((item, index) => {
                  const isCommand = "command" in item;

                  return (
                    <motion.div
                      key={
                        isCommand ? (item as Command).id : (item as Template).id
                      }
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.02, 0.5),
                      }}
                      className="break-inside-avoid mb-6"
                    >
                      {isCommand ? (
                        <CommandCard
                          command={item as Command}
                          categories={data.categories}
                          onCopy={handleCopy}
                          copiedId={copiedId}
                        />
                      ) : (
                        <TemplateCard
                          template={item as Template}
                          categories={data.categories}
                          onCopy={handleCopy}
                          copiedId={copiedId}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-8"
              >
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  Load More ({allItems.length - displayCount} remaining)
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};
