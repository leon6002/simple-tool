"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

interface CommandCheatsheetProps {
  id: string;
}

export const CommandCheatsheet = (props: CommandCheatsheetProps) => {
  const { data, loading, error } = useCommands(props.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { addRecentlyUsedTool } = useUserPreferencesStore();
  const { copyToClipboard } = useCopyToClipboard();

  // 记录最近使用的工具
  useEffect(() => {
    addRecentlyUsedTool(`${props.id}-cheatsheet`);
  }, [addRecentlyUsedTool, props.id]);

  if (loading) return <CommandSkeleton />;

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error}
      </div>
    );
  }

  const filteredCommands = data.commands.filter((command: Command) => {
    const matchesSearch =
      command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || command.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredTemplate = data.templates.filter((template: Template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

        {/* Commands List */}
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {filteredCommands.length > 0 &&
            filteredCommands.map((command: Command, index: number) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="break-inside-avoid mb-6"
              >
                <CommandCard
                  command={command}
                  categories={data.categories}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              </motion.div>
            ))}
          {filteredTemplate.length > 0 &&
            filteredTemplate.map((template: Template, index: number) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="break-inside-avoid mb-6"
              >
                <TemplateCard
                  template={template}
                  categories={data.categories}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              </motion.div>
            ))}

          {filteredTemplate.length === 0 && filteredCommands.length === 0 && (
            <EmptyCard />
          )}
        </div>
      </motion.div>
    </div>
  );
};
