"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Folder,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteDialog } from "@/components/site-navigator/site-dialog";
import { CategoryDialog } from "@/components/site-navigator/category-dialog";
import toast from "react-hot-toast";
import type { SiteNavigatorData, Site, SiteCategory } from "@/types";

export default function SiteNavigatorPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<SiteNavigatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // 对话框状态
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [editingCategory, setEditingCategory] = useState<SiteCategory | null>(
    null
  );

  // 检查是否是管理员
  useEffect(() => {
    if (session?.user) {
      setIsAdmin((session.user as any)?.role === "admin");
    }
  }, [session]);

  // 加载网址数据
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sites");
      if (!response.ok) throw new Error("Failed to fetch sites");
      const sitesData = await response.json();
      setData(sitesData);
    } catch (error) {
      console.error("Error fetching sites:", error);
      toast.error("加载网址数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 按分类分组所有网址（用于显示数量）
  const allGroupedSites = data?.categories.reduce((acc, category) => {
    acc[category.id] =
      data?.sites.filter((site) => site.categoryId === category.id) || [];
    return acc;
  }, {} as Record<string, Site[]>);

  // 过滤网址
  const filteredSites = data?.sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || site.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 按分类分组过滤后的网址（用于显示内容）
  const groupedSites = data?.categories.reduce((acc, category) => {
    acc[category.id] =
      filteredSites?.filter((site) => site.categoryId === category.id) || [];
    return acc;
  }, {} as Record<string, Site[]>);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* 左侧：标题和图标 */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <Compass className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  网址导航
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  快速访问常用网站
                </p>
              </div>
            </div>

            {/* 中间：搜索框 */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="搜索网址..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* 右侧：管理按钮 */}
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setEditingSite(null);
                    setSiteDialogOpen(true);
                  }}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">添加网址</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Folder className="h-4 w-4" />
                  <span className="hidden md:inline">添加分类</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧：分类侧边栏（桌面端） */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-64 shrink-0"
          >
            <div className="sticky top-24 space-y-2">
              <h2 className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                分类
              </h2>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>全部</span>
                  <span className="ml-auto text-xs opacity-60">
                    {data?.sites.length || 0}
                  </span>
                </button>
                {data?.categories.map((category) => {
                  const count = allGroupedSites?.[category.id]?.length || 0;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Folder className="h-4 w-4" />
                      <span>{category.name}</span>
                      <span className="ml-auto text-xs opacity-60">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.aside>

          {/* 移动端分类标签 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:hidden w-full mb-6"
          >
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">全部</TabsTrigger>
                {data?.categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* 右侧：网址内容区域 */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 min-w-0"
          >
            {selectedCategory === "all" ? (
              // 显示所有分类
              <div className="space-y-10">
                {data?.categories.map((category) => {
                  const sites = groupedSites?.[category.id] || [];
                  if (sites.length === 0) return null;

                  return (
                    <div key={category.id}>
                      <div className="flex items-center gap-3 mb-5">
                        <Folder className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                        <span className="text-sm text-muted-foreground">
                          {sites.length} 个网址
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {sites.map((site) => (
                          <SiteCard
                            key={site.id}
                            site={site}
                            isAdmin={isAdmin}
                            onEdit={() => {
                              setEditingSite(site);
                              setSiteDialogOpen(true);
                            }}
                            onDelete={async () => {
                              if (confirm(`确定要删除 "${site.name}" 吗？`)) {
                                try {
                                  const response = await fetch(
                                    `/api/sites?type=site&id=${site.id}`,
                                    { method: "DELETE" }
                                  );
                                  if (!response.ok)
                                    throw new Error("Delete failed");
                                  toast.success("删除成功");
                                  fetchSites();
                                } catch (error) {
                                  console.error("Error deleting site:", error);
                                  toast.error("删除失败");
                                }
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // 显示选中的分类
              <>
                <div className="flex items-center gap-3 mb-5">
                  <Folder className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">
                    {data?.categories.find((c) => c.id === selectedCategory)
                      ?.name || "分类"}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredSites?.length || 0} 个网址
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filteredSites?.map((site) => (
                    <SiteCard
                      key={site.id}
                      site={site}
                      isAdmin={isAdmin}
                      onEdit={() => {
                        setEditingSite(site);
                        setSiteDialogOpen(true);
                      }}
                      onDelete={async () => {
                        if (confirm(`确定要删除 "${site.name}" 吗？`)) {
                          try {
                            const response = await fetch(
                              `/api/sites?type=site&id=${site.id}`,
                              { method: "DELETE" }
                            );
                            if (!response.ok) throw new Error("Delete failed");
                            toast.success("删除成功");
                            fetchSites();
                          } catch (error) {
                            console.error("Error deleting site:", error);
                            toast.error("删除失败");
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {filteredSites?.length === 0 && (
              <div className="text-center py-20">
                <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">
                  没有找到相关网址
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  尝试使用其他关键词搜索
                </p>
              </div>
            )}
          </motion.main>
        </div>
      </div>

      {/* 对话框 */}
      <SiteDialog
        open={siteDialogOpen}
        onOpenChange={setSiteDialogOpen}
        site={editingSite}
        categories={data?.categories || []}
        onSuccess={fetchSites}
      />
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSuccess={fetchSites}
      />
    </div>
  );
}

// 网址卡片组件
function SiteCard({
  site,
  isAdmin,
  onEdit,
  onDelete,
}: {
  site: Site;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-primary/50">
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5"
      >
        <div className="flex flex-col gap-4">
          {/* 网站图标和名称 */}
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {site.icon ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={site.icon}
                    alt={site.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 图标加载失败时显示默认图标
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">${site.name
                          .charAt(0)
                          .toUpperCase()}</div>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {site.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 网站名称 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base mb-0.5 truncate flex items-center gap-2">
                {site.name}
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {new URL(site.url).hostname}
              </p>
            </div>
          </div>

          {/* 网站描述 */}
          {site.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {site.description}
            </p>
          )}
        </div>
      </a>

      {/* 管理员操作按钮 */}
      {isAdmin && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-primary/10"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </Card>
  );
}
