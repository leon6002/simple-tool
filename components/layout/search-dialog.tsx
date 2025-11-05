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

  // 按分类分组工具
  const groupedTools = React.useMemo(() => {
    const groups: Record<string, typeof TOOLS> = {};

    TOOLS.forEach((tool) => {
      const category = CATEGORIES.find((cat) => cat.id === tool.category);
      const categoryName = category?.name || "Other";

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(tool);
    });

    return groups;
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tools..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedTools).map(([categoryName, tools]) => (
          <CommandGroup key={categoryName} heading={categoryName}>
            {tools.map((tool) => {
              const Icon = iconMap[tool.icon] || FileText;
              return (
                <CommandItem
                  key={tool.id}
                  value={tool.name}
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
        ))}
      </CommandList>
    </CommandDialog>
  );
}
