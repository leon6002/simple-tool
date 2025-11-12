import { NextRequest, NextResponse } from "next/server";
import { recognizeText, getOCRProvider } from "../services/ocr-service";

/**
 * OCR文字识别接口 - 只负责从图片中提取文字
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const provider = getOCRProvider();
    console.log(`使用 ${provider.toUpperCase()} OCR 进行识别`);

    // 调用统一的OCR服务
    const ocrText = await recognizeText(image);

    if (!ocrText) {
      return NextResponse.json(
        { error: "No text recognized from image" },
        { status: 400 }
      );
    }

    console.log("OCR text extracted:", ocrText.substring(0, 200) + "...");

    // 简单判断彩票类型
    let lotteryType = "unknown";
    if (ocrText.includes("超级大乐透") || ocrText.includes("大乐透")) {
      lotteryType = "dlt";
    } else if (ocrText.includes("双色球")) {
      lotteryType = "ssq";
    } else if (ocrText.includes("快乐8") || ocrText.includes("快乐八")) {
      lotteryType = "kl8";
    }

    return NextResponse.json({
      success: true,
      ocrText,
      lotteryType,
      provider, // 返回使用的OCR提供商
    });
  } catch (error) {
    console.error("Error in OCR text recognition:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
