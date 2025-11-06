import { NextResponse } from "next/server";
import { fetchLatestSSQData } from "@/lib/utils/lottery";

/**
 * 获取双色球最近开奖历史
 */
export async function GET() {
  try {
    const data = await fetchLatestSSQData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch SSQ history:", error);
    return NextResponse.json(
      { error: "Failed to fetch SSQ history" },
      { status: 500 }
    );
  }
}

