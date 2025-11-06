import { NextRequest, NextResponse } from "next/server";

// OCR API configuration
const OCR_API_KEY =
  process.env.OCR_API_KEY ||
  "sk-ojeleuybhlruuuhvbuteobvzlcbttegdwtijjqnixdduqoij";
const OCR_BASE_URL =
  process.env.OCR_BASE_URL || "https://api.siliconflow.cn/v1";

interface OCRResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * OCR文字识别接口 - 只负责从图片中提取文字
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 调用 DeepSeek OCR API (使用 chat/completions 端点)
    const ocrResponse = await fetch(`${OCR_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OCR_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-OCR",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
              {
                type: "text",
                text: "<image>\n<|grounding|>Convert the document to markdown. ",
              },
            ],
          },
        ],
      }),
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error("OCR API error:", errorText);
      return NextResponse.json(
        { error: "OCR recognition failed" },
        { status: 500 }
      );
    }

    const ocrData: OCRResponse = await ocrResponse.json();
    const ocrText = ocrData.choices[0]?.message?.content || "";

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
    }

    return NextResponse.json({
      success: true,
      ocrText,
      lotteryType,
    });
  } catch (error) {
    console.error("Error in OCR text recognition:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
