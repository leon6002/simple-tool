import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 验证 URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // 获取网页内容
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 提取元数据
      const metadata = {
        title: "",
        description: "",
        icon: "",
      };

      // 获取标题
      metadata.title =
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("title").text() ||
        parsedUrl.hostname;

      // 获取描述
      metadata.description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="twitter:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";

      // 获取图标
      const ogImage = $('meta[property="og:image"]').attr("content");
      const twitterImage = $('meta[name="twitter:image"]').attr("content");
      const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr("href");
      const icon = $('link[rel="icon"]').attr("href");
      const shortcutIcon = $('link[rel="shortcut icon"]').attr("href");

      // 优先使用 favicon，如果没有则使用 og:image
      let iconUrl = icon || shortcutIcon || appleTouchIcon;

      if (iconUrl) {
        // 处理相对路径
        if (iconUrl.startsWith("//")) {
          iconUrl = parsedUrl.protocol + iconUrl;
        } else if (iconUrl.startsWith("/")) {
          iconUrl = parsedUrl.origin + iconUrl;
        } else if (!iconUrl.startsWith("http")) {
          iconUrl = parsedUrl.origin + "/" + iconUrl;
        }
        metadata.icon = iconUrl;
      } else {
        // 如果没有找到 favicon，尝试使用 og:image 或 twitter:image
        if (ogImage) {
          metadata.icon = ogImage.startsWith("http")
            ? ogImage
            : parsedUrl.origin + ogImage;
        } else if (twitterImage) {
          metadata.icon = twitterImage.startsWith("http")
            ? twitterImage
            : parsedUrl.origin + twitterImage;
        } else {
          // 最后尝试默认的 favicon.ico
          metadata.icon = `${parsedUrl.origin}/favicon.ico`;
        }
      }

      // 清理标题（移除多余的空白和换行）
      metadata.title = metadata.title.trim().replace(/\s+/g, " ");
      metadata.description = metadata.description.trim().replace(/\s+/g, " ");

      // 限制描述长度
      if (metadata.description.length > 200) {
        metadata.description = metadata.description.substring(0, 200) + "...";
      }

      return NextResponse.json({
        success: true,
        metadata,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error fetching website:", fetchError);

      // 如果获取失败，返回基本信息
      return NextResponse.json({
        success: true,
        metadata: {
          title: parsedUrl.hostname,
          description: "",
          icon: `${parsedUrl.origin}/favicon.ico`,
        },
      });
    }
  } catch (error) {
    console.error("Error getting metadata:", error);
    return NextResponse.json(
      { error: "Failed to get metadata" },
      { status: 500 }
    );
  }
}

