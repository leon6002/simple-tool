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
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { SiteCategory } from "@/types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: SiteCategory | null;
  onSuccess: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "Folder",
  });

  // 当对话框打开或 category 改变时，更新表单数据
  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          name: category.name,
          icon: category.icon || "Folder",
        });
      } else {
        setFormData({
          name: "",
          icon: "Folder",
        });
      }
    }
  }, [open, category]);

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!formData.name) {
      toast.error("请输入分类名称");
      return;
    }

    try {
      setLoading(true);

      const url = "/api/sites";
      const method = category ? "PUT" : "POST";
      const body = category
        ? {
            type: "category",
            id: category.id,
            data: formData,
          }
        : {
            type: "category",
            data: formData,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to save category");
      }

      toast.success(category ? "分类更新成功" : "分类添加成功");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(category ? "更新失败" : "添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "编辑分类" : "添加分类"}
          </DialogTitle>
          <DialogDescription>
            {category ? "修改分类信息" : "添加一个新的分类"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 分类名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              分类名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="例如：开发工具"
              required
            />
          </div>

          {/* 图标名称 */}
          <div className="space-y-2">
            <Label htmlFor="icon">图标名称（Lucide 图标）</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, icon: e.target.value }))
              }
              placeholder="例如：Code, Palette, Zap"
            />
            <p className="text-xs text-muted-foreground">
              参考：
              <a
                href="https://lucide.dev/icons/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Lucide Icons
              </a>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? "保存" : "添加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

