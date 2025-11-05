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
import { CommandCategory, Template } from "@/types";
import { CodeHighlight } from "./CodeHighlight";

interface CommandCardProps {
  template: Template;
  categories: CommandCategory[];
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  isAdmin?: boolean;
  onEdit?: (template: Template) => void;
}

export function TemplateCard({
  template,
  categories,
  onCopy,
  copiedId,
  isAdmin = false,
  onEdit,
}: CommandCardProps) {
  const handleCopy = () => {
    onCopy(template.content, template.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(template);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600 shrink-0" />
              <span className="truncate">{template.name}</span>
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs whitespace-nowrap shrink-0"
          >
            {categories.find((c) => c.id === template.category)?.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 grow flex flex-col">
        {/* 代码预览区域 - 使用 Shiki 语法高亮 */}
        <div className="relative flex-1 min-h-0 group/code">
          <CodeHighlight
            code={template.content}
            language={template.language || "bash"}
            className="h-full max-h-[400px] overflow-auto rounded-lg shadow-inner"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {template.content.split("\n").length} lines
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
              {copiedId === template.id ? "Copied!" : "Copy Template"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
