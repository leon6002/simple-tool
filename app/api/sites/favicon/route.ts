import { NextRequest, NextResponse } from "next/server";

// 获取网站的 favicon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 解析 URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // 尝试多种方式获取 favicon
    const faviconUrls = [
      // 1. 标准 favicon.ico
      `${parsedUrl.origin}/favicon.ico`,
      // 2. Google favicon service (备用)
      `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`,
      // 3. DuckDuckGo favicon service (备用)
      `https://icons.duckduckgo.com/ip3/${parsedUrl.hostname}.ico`,
    ];

    // 尝试获取第一个可用的 favicon
    for (const faviconUrl of faviconUrls) {
      try {
        const response = await fetch(faviconUrl, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000), // 5秒超时
        });

        if (response.ok) {
          return NextResponse.json({
            success: true,
            icon: faviconUrl,
            source: faviconUrl.includes("google") ? "google" : 
                    faviconUrl.includes("duckduckgo") ? "duckduckgo" : "direct",
          });
        }
      } catch (error) {
        // 继续尝试下一个
        continue;
      }
    }

    // 如果都失败了，返回 Google 的服务（通常最可靠）
    const fallbackIcon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
    return NextResponse.json({
      success: true,
      icon: fallbackIcon,
      source: "fallback",
    });
  } catch (error) {
    console.error("Error fetching favicon:", error);
    return NextResponse.json(
      { error: "Failed to fetch favicon" },
      { status: 500 }
    );
  }
}

