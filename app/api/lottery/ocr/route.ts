import { NextRequest, NextResponse } from "next/server";
import { recognizeText, getOCRProvider } from "../services/ocr-service";

// OCR API configuration (for AI parsing)
const OCR_API_KEY = process.env.OCR_API_KEY || "";
const OCR_BASE_URL =
  process.env.OCR_BASE_URL || "https://api.siliconflow.cn/v1";

interface OCRResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface LotteryBet {
  sequence: number;
  front_numbers: number[];
  back_numbers: number[];
}

interface StoreInfo {
  name: string;
  address: string;
}

interface ParsedLotteryData {
  lottery_type: string;
  issue_number: string;
  draw_date: string;
  ticket_type: string;
  multiple: number;
  total_amount: number;
  contribution_to_charity: number;
  serial_numbers: string[];
  bets: LotteryBet[];
  prize_pool?: number;
  previous_jackpot?: number;
  store_info?: StoreInfo;
  ticket_id?: string;
  print_time?: string;
}

// Parse OCR text using AI
async function parseOCRWithAI(
  ocrText: string
): Promise<ParsedLotteryData | null> {
  try {
    const prompt = `你是一个专业的彩票信息提取助手。请从以下OCR识别的文本中提取彩票信息，并以JSON格式返回。

要求：
1. 提取所有可识别的字段
2. 如果某个字段无法识别，可以省略该字段
3. 号码必须是数字数组
4. 日期格式为 YYYY-MM-DD
5. 金额为数字类型
6. 只返回JSON，不要有其他说明文字

返回格式示例：
{
  "lottery_type": "体彩超级大乐透",
  "issue_number": "25092",
  "draw_date": "2025-08-13",
  "ticket_type": "单式票",
  "multiple": 1,
  "total_amount": 20,
  "contribution_to_charity": 7.2,
  "serial_numbers": ["910320", "186661"],
  "bets": [
    {
      "sequence": 1,
      "front_numbers": [1, 7, 8, 9, 19],
      "back_numbers": [9, 11]
    }
  ],
  "prize_pool": 1250000000,
  "previous_jackpot": 10000000,
  "store_info": {
    "name": "鑫多多福多多便利店",
    "address": "铂岸中心1栋113室"
  },
  "ticket_id": "01-272111-101 00001",
  "print_time": "2025-08-12 07:07:01"
}

OCR识别结果：
${ocrText}

请提取信息并返回JSON：`;

    const response = await fetch(`${OCR_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OCR_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3.1-Terminus",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error(
        `AI parsing error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: OCRResponse = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";

    if (!aiResponse) {
      return null;
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response");
      return null;
    }

    const parsedData: ParsedLotteryData = JSON.parse(jsonMatch[0]);
    return parsedData;
  } catch (error) {
    console.error("AI parsing error:", error);
    return null;
  }
}

// Convert AI parsed result to legacy format for backward compatibility
function convertAIParsedToLegacyFormat(aiData: ParsedLotteryData) {
  return {
    type: aiData.lottery_type?.includes("大乐透")
      ? "dlt"
      : aiData.lottery_type?.includes("双色球")
      ? "ssq"
      : null,
    issueNumber: aiData.issue_number || null,
    drawDate: aiData.draw_date || null,
    totalCost: aiData.total_amount || null,
    entries: aiData.bets.map((bet) => ({
      numbers: bet.front_numbers,
      specialNumbers: bet.back_numbers,
    })),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const provider = getOCRProvider();
    console.log(`使用 ${provider.toUpperCase()} OCR 进行识别`);

    // 调用统一的OCR服务
    const ocrText = await recognizeText(imageBase64);

    if (!ocrText) {
      return NextResponse.json(
        { error: "Failed to extract text from image" },
        { status: 500 }
      );
    }

    console.log("ocrText:", ocrText);

    // Parse OCR result using AI
    const aiParsedResult = await parseOCRWithAI(ocrText);

    // Fallback to rule-based parsing if AI parsing fails
    const parsedResult = aiParsedResult
      ? convertAIParsedToLegacyFormat(aiParsedResult)
      : null;

    return NextResponse.json({
      success: true,
      ocrText,
      parsedResult,
      aiParsedResult, // Include full AI parsed data
      provider, // 返回使用的OCR提供商
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
