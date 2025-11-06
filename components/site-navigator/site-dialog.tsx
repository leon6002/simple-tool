"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Site, SiteCategory } from "@/types";

interface SiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null;
  categories: SiteCategory[];
  onSuccess: () => void;
}

export function SiteDialog({
  open,
  onOpenChange,
  site,
  categories,
  onSuccess,
}: SiteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataFetched, setMetadataFetched] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    icon: "",
    categoryId: "",
  });
  const urlInputRef = useRef<HTMLInputElement>(null);

  // 当对话框打开或 site 改变时，更新表单数据
  useEffect(() => {
    if (open) {
      if (site) {
        setFormData({
          name: site.name,
          url: site.url,
          description: site.description || "",
          icon: site.icon || "",
          categoryId: site.categoryId,
        });
        setMetadataFetched(true);
      } else {
        setFormData({
          name: "",
          url: "",
          description: "",
          icon: "",
          categoryId: categories[0]?.id || "",
        });
        setMetadataFetched(false);
        // 聚焦到 URL 输入框
        setTimeout(() => {
          urlInputRef.current?.focus();
        }, 100);
      }
    }
  }, [open, site, categories]);

  // 自动获取网站元数据（标题、描述、图标）
  const fetchMetadata = async (url: string) => {
    if (!url) return;

    // 验证 URL
    try {
      new URL(url);
    } catch {
      return;
    }

    try {
      setFetchingMetadata(true);
      const response = await fetch(
        `/api/sites/metadata?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.success && data.metadata) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || data.metadata.title,
          description: prev.description || data.metadata.description,
          icon: prev.icon || data.metadata.icon,
        }));
        setMetadataFetched(true);
        toast.success("网站信息获取成功");
      } else {
        toast.error("无法获取网站信息");
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("获取网站信息失败");
    } finally {
      setFetchingMetadata(false);
    }
  };

  // 手动刷新元数据
  const handleRefreshMetadata = () => {
    if (formData.url) {
      fetchMetadata(formData.url);
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!formData.name || !formData.url || !formData.categoryId) {
      toast.error("请填写必填字段");
      return;
    }

    // 验证 URL
    try {
      new URL(formData.url);
    } catch {
      toast.error("请输入有效的 URL");
      return;
    }

    try {
      setLoading(true);

      const url = site ? "/api/sites" : "/api/sites";
      const method = site ? "PUT" : "POST";
      const body = site
        ? {
            type: "site",
            id: site.id,
            data: formData,
          }
        : {
            type: "site",
            data: formData,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to save site");
      }

      toast.success(site ? "网址更新成功" : "网址添加成功");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving site:", error);
      toast.error(site ? "更新失败" : "添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{site ? "编辑网址" : "添加网址"}</DialogTitle>
          <DialogDescription>
            {site ? "修改网址信息" : "添加一个新的网址到导航"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL - 第一步 */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center justify-between">
              <span>
                网址 URL <span className="text-destructive">*</span>
              </span>
              {!site && metadataFetched && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  已获取信息
                </span>
              )}
            </Label>
            <div className="flex gap-2">
              <Input
                ref={urlInputRef}
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, url: e.target.value }));
                  setMetadataFetched(false);
                }}
                onBlur={(e) => {
                  const url = e.target.value.trim();
                  if (url && !site && !metadataFetched) {
                    fetchMetadata(url);
                  }
                }}
                placeholder="https://example.com"
                required
                disabled={fetchingMetadata}
              />
              {formData.url && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshMetadata}
                  disabled={fetchingMetadata}
                  title="重新获取网站信息"
                >
                  {fetchingMetadata ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {fetchingMetadata && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                正在获取网站信息...
              </p>
            )}
          </div>

          {/* 网址名称 - 自动填充 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              网址名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="自动获取或手动输入"
              required
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="简短描述这个网站..."
              rows={3}
            />
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label htmlFor="category">
              分类 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, categoryId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 图标 URL - 自动填充 */}
          <div className="space-y-2">
            <Label htmlFor="icon">图标 URL（可选）</Label>
            <div className="flex gap-2">
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="自动获取或手动输入"
              />
              {formData.icon && (
                <div className="shrink-0 w-10 h-10 border rounded flex items-center justify-center bg-muted">
                  <img
                    src={formData.icon}
                    alt="Icon preview"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
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
              {site ? "保存" : "添加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
