import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    if (type == null) {
      throw new Error("type param is not valid");
    }

    // 从 public/data 目录读取 JSON 文件
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      `${type}-commands.json`
    );

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Command data for type '${type}' not found` },
        { status: 404 }
      );
    }

    // 读取并解析 JSON 文件
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch commands: ", err },
      { status: 500 }
    );
  }
}
