import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import type { SiteNavigatorData, Site, SiteCategory } from "@/types";

const SITES_FILE_PATH = path.join(
  process.cwd(),
  "public/data/sites/sites.json"
);

// 读取网址数据
async function readSitesData(): Promise<SiteNavigatorData> {
  try {
    const data = await fs.readFile(SITES_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading sites data:", error);
    // 如果文件不存在，返回默认数据
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      categories: [],
      sites: [],
    };
  }
}

// 保存网址数据
async function writeSitesData(data: SiteNavigatorData): Promise<void> {
  try {
    // 确保目录存在
    const dir = path.dirname(SITES_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });

    // 更新最后修改时间
    data.lastUpdated = new Date().toISOString();

    // 写入文件
    await fs.writeFile(SITES_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing sites data:", error);
    throw error;
  }
}

// GET - 获取所有网址数据
export async function GET() {
  try {
    const data = await readSitesData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites data" },
      { status: 500 }
    );
  }
}

// POST - 添加新网址或分类
export async function POST(request: NextRequest) {
  try {
    // 检查管理员权限
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, data: itemData } = body;

    const sitesData = await readSitesData();

    if (type === "site") {
      // 添加新网址
      const newSite: Site = {
        id: `site_${Date.now()}`,
        name: itemData.name,
        url: itemData.url,
        description: itemData.description || "",
        icon: itemData.icon || "",
        categoryId: itemData.categoryId,
        order:
          sitesData.sites.filter((s) => s.categoryId === itemData.categoryId)
            .length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sitesData.sites.push(newSite);
      await writeSitesData(sitesData);

      return NextResponse.json({ success: true, data: newSite });
    } else if (type === "category") {
      // 添加新分类
      const newCategory: SiteCategory = {
        id: `cat_${Date.now()}`,
        name: itemData.name,
        icon: itemData.icon || "Folder",
        order: sitesData.categories.length + 1,
      };

      sitesData.categories.push(newCategory);
      await writeSitesData(sitesData);

      return NextResponse.json({ success: true, data: newCategory });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST /api/sites:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// PUT - 更新网址或分类
export async function PUT(request: NextRequest) {
  try {
    // 检查管理员权限
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, data: itemData } = body;

    const sitesData = await readSitesData();

    if (type === "site") {
      // 更新网址
      const siteIndex = sitesData.sites.findIndex((s) => s.id === id);
      if (siteIndex === -1) {
        return NextResponse.json({ error: "Site not found" }, { status: 404 });
      }

      sitesData.sites[siteIndex] = {
        ...sitesData.sites[siteIndex],
        ...itemData,
        updatedAt: new Date().toISOString(),
      };

      await writeSitesData(sitesData);
      return NextResponse.json({
        success: true,
        data: sitesData.sites[siteIndex],
      });
    } else if (type === "category") {
      // 更新分类
      const categoryIndex = sitesData.categories.findIndex((c) => c.id === id);
      if (categoryIndex === -1) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      sitesData.categories[categoryIndex] = {
        ...sitesData.categories[categoryIndex],
        ...itemData,
      };

      await writeSitesData(sitesData);
      return NextResponse.json({
        success: true,
        data: sitesData.categories[categoryIndex],
      });
    } else if (type === "reorder") {
      // 重新排序
      if (itemData.sites) {
        sitesData.sites = itemData.sites;
      }
      if (itemData.categories) {
        sitesData.categories = itemData.categories;
      }

      await writeSitesData(sitesData);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error in PUT /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE - 删除网址或分类
export async function DELETE(request: NextRequest) {
  try {
    // 检查管理员权限
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const sitesData = await readSitesData();

    if (type === "site") {
      // 删除网址
      sitesData.sites = sitesData.sites.filter((s) => s.id !== id);
      await writeSitesData(sitesData);
      return NextResponse.json({ success: true });
    } else if (type === "category") {
      // 删除分类（同时删除该分类下的所有网址）
      sitesData.categories = sitesData.categories.filter((c) => c.id !== id);
      sitesData.sites = sitesData.sites.filter((s) => s.categoryId !== id);
      await writeSitesData(sitesData);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error in DELETE /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
