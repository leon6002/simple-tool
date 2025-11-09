import { NextResponse } from "next/server";
import { forceRefreshAll, clearAllLotteryCache } from "@/lib/utils/lottery-cache-manager";

/**
 * 手动刷新彩票缓存数据
 */
export async function GET() {
  try {
    const data = await forceRefreshAll();

    return NextResponse.json({
      success: true,
      message: "彩票数据缓存已刷新",
      data: {
        ssqCount: data.ssq.length,
        dltCount: data.dlt.length,
        kl8Count: data.kl8.length,
        ssqLatest: data.ssq[0]?.issue || null,
        dltLatest: data.dlt[0]?.issue || null,
        kl8Latest: data.kl8[0]?.issue || null,
      }
    });
  } catch (error) {
    console.error("刷新彩票缓存失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "刷新彩票缓存失败",
      },
      { status: 500 }
    );
  }
}

/**
 * 清除所有彩票缓存
 */
export async function DELETE() {
  try {
    clearAllLotteryCache();

    return NextResponse.json({
      success: true,
      message: "彩票缓存已清除",
    });
  } catch (error) {
    console.error("清除彩票缓存失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "清除彩票缓存失败",
      },
      { status: 500 }
    );
  }
}