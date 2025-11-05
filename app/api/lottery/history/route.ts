import { NextResponse } from "next/server";
import { fetchLatestDLTData } from "@/lib/utils/lottery";

export async function GET() {
  try {
    const results = await fetchLatestDLTData();
    
    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("获取开奖数据失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "获取开奖数据失败",
      },
      { status: 500 }
    );
  }
}

