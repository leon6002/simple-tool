import getCommands from "@/data/commands-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    if (type == null) {
      throw new Error("type param is not valid");
    }
    const data = await getCommands(type);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch git commands: ", err },
      { status: 500 }
    );
  }
}
