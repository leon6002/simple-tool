"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
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
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { TOOLS, CATEGORIES } from "@/lib/constants/tools";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import type { Tool } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const { addToSearchHistory, addRecentlyUsedTool } = useUserPreferencesStore();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  // 自定义搜索过滤函数
  const filterTools = React.useCallback((tool: Tool, searchTerm: string) => {
    if (!searchTerm) return true;

    const lowerSearch = searchTerm.toLowerCase().trim();

    // 搜索名称
    if (tool.name.toLowerCase().includes(lowerSearch)) return true;

    // 搜索描述
    if (tool.description.toLowerCase().includes(lowerSearch)) return true;

    // 搜索关键词
    if (tool.keywords) {
      return tool.keywords.some((keyword) =>
        keyword.toLowerCase().includes(lowerSearch)
      );
    }

    return false;
  }, []);

  // 按分类分组工具，并根据搜索词过滤
  const groupedTools = React.useMemo(() => {
    const groups: Record<string, typeof TOOLS> = {};

    TOOLS.forEach((tool) => {
      // 如果有搜索词，先过滤
      if (search && !filterTools(tool, search)) {
        return;
      }

      const category = CATEGORIES.find((cat) => cat.id === tool.category);
      const categoryName = category?.name || "Other";

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(tool);
    });

    return groups;
  }, [search, filterTools]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search tools..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedTools).map(([categoryName, tools]) => {
          // 如果该分类下没有工具，不显示分类
          if (tools.length === 0) return null;

          return (
            <CommandGroup key={categoryName} heading={categoryName}>
              {tools.map((tool) => {
                const Icon = iconMap[tool.icon] || FileText;

                return (
                  <CommandItem
                    key={tool.id}
                    value={tool.id}
                    keywords={tool.keywords}
                    onSelect={() => {
                      runCommand(() => {
                        addToSearchHistory(tool.name);
                        addRecentlyUsedTool(tool.href);
                        router.push(tool.href);
                      });
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div>
                      <p>{tool.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
