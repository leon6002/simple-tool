"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, GitBranch, Edit } from "lucide-react";
import { Command, CommandCategory } from "@/types/index";
import { CodeHighlight } from "../CodeHighlight";

interface CommandCardProps {
  command: Command;
  categories: CommandCategory[];
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  isAdmin?: boolean;
  onEdit?: (command: Command) => void;
}

export function CommandCard({
  command,
  categories,
  onCopy,
  copiedId,
  isAdmin = false,
  onEdit,
}: CommandCardProps) {
  const handleCopy = () => {
    onCopy(command.command, command.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(command);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600 shrink-0" />
              <span className="truncate">{command.name}</span>
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {command.description}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs whitespace-nowrap shrink-0"
          >
            {categories.find((c) => c.id === command.category)?.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 grow flex flex-col">
        {/* 命令展示区域 */}
        <div className="relative group/command">
          <CodeHighlight
            code={command.command}
            language={command.language || "bash"}
            className="h-full max-h-[400px] overflow-auto rounded-lg shadow-inner"
          />
        </div>

        {/* Example 区域 */}
        {command.example && command.example !== command.command && (
          <div className="flex-1 min-h-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Example
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <div className="relative">
              <CodeHighlight
                code={command.example}
                language={command.language || "bash"}
                className="h-full max-h-[400px] overflow-auto rounded-lg shadow-inner"
              />
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
          <div className="text-xs text-muted-foreground">
            {command.example ? "With example" : "Command only"}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-2 transition-all hover:scale-105 hover:bg-blue-500/10 hover:border-blue-500/50"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2 transition-all hover:scale-105 hover:bg-purple-500/10 hover:border-purple-500/50"
            >
              <Copy className="h-4 w-4" />
              {copiedId === command.id ? "Copied!" : "Copy Command"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
