import { NextResponse } from "next/server";
import { fetchLatestKL8Data } from "@/lib/utils/lottery";

/**
 * 获取快乐8最近开奖历史
 */
export async function GET() {
  try {
    const data = await fetchLatestKL8Data();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch KL8 history:", error);
    return NextResponse.json(
      { error: "Failed to fetch KL8 history" },
      { status: 500 }
    );
  }
}