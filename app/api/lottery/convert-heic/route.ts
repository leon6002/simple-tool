import { NextRequest, NextResponse } from "next/server";
import convert from "heic-convert";

/**
 * HEIC/HEIF格式转换API
 * 将HEIC/HEIF格式的图片转换为JPEG格式
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "未提供图片数据" },
        { status: 400 }
      );
    }

    // 移除base64前缀
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    console.log(
      `收到HEIC转换请求，原始大小: ${(buffer.length / 1024 / 1024).toFixed(
        2
      )} MB`
    );

    // 使用heic-convert转换为JPEG
    const convertedBuffer = await convert({
      buffer: buffer,
      format: "JPEG",
      quality: 0.9, // 质量 0-1
    });

    console.log(
      `HEIC转换成功，转换后大小: ${(
        Buffer.byteLength(convertedBuffer) /
        1024 /
        1024
      ).toFixed(2)} MB`
    );

    // 转换为base64
    const convertedBase64 = `data:image/jpeg;base64,${Buffer.from(
      convertedBuffer
    ).toString("base64")}`;

    return NextResponse.json({
      success: true,
      image: convertedBase64,
    });
  } catch (error) {
    console.error("HEIC转换失败:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "HEIC格式转换失败，请尝试其他格式",
      },
      { status: 500 }
    );
  }
}
