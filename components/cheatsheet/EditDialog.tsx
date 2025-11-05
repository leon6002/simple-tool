"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, Template, CommandCategory } from "@/types";
import toast from "react-hot-toast";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Command | Template | null;
  type: "command" | "template";
  categories: CommandCategory[];
  cheatsheetId: string;
  onSave: () => void;
  mode?: "edit" | "create"; // 新增：编辑或创建模式
}

export function EditDialog({
  open,
  onOpenChange,
  item,
  type,
  categories,
  cheatsheetId,
  onSave,
  mode = "edit",
}: EditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    command: "",
    example: "",
    content: "",
    language: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      // 创建模式：重置表单
      setFormData({
        name: "",
        description: "",
        category: "",
        command: "",
        example: "",
        content: "",
        language: type === "command" ? "bash" : "",
      });
    } else if (item) {
      // 编辑模式：填充现有数据
      if (type === "command") {
        const cmd = item as Command;
        setFormData({
          name: cmd.name,
          description: cmd.description,
          category: cmd.category,
          command: cmd.command,
          example: cmd.example,
          content: "",
          language: cmd.language || "bash",
        });
      } else {
        const tpl = item as Template;
        setFormData({
          name: tpl.name,
          description: tpl.description,
          category: tpl.category,
          command: "",
          example: "",
          content: tpl.content,
          language: tpl.language,
        });
      }
    }
  }, [item, type, mode]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const method = mode === "create" ? "POST" : "PUT";
      const response = await fetch("/api/admin/cheatsheet", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cheatsheetId,
          itemId: item?.id,
          type,
          data: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      toast.success(
        mode === "create" ? "Created successfully!" : "Saved successfully!"
      );
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        mode === "create" ? "Failed to create" : "Failed to save changes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New" : "Edit"}{" "}
            {type === "command" ? "Command" : "Template"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Create a new ${type} below.`
              : `Make changes to the ${type} content below.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "command" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <Textarea
                  id="command"
                  value={formData.command}
                  onChange={(e) =>
                    setFormData({ ...formData, command: e.target.value })
                  }
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="example">Example</Label>
                <Textarea
                  id="example"
                  value={formData.example}
                  onChange={(e) =>
                    setFormData({ ...formData, example: e.target.value })
                  }
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  placeholder="e.g., bash, javascript, python"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create"
              : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
