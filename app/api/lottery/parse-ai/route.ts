import { NextRequest, NextResponse } from "next/server";

// API configuration
const OCR_API_KEY = process.env.OCR_API_KEY || "";
const OCR_BASE_URL =
  process.env.OCR_BASE_URL || "https://api.siliconflow.cn/v1";

// 大乐透的AI解析prompt
const DLT_PROMPT = `你是一个专业的彩票信息提取助手。请从以下OCR识别的文本中提取体彩超级大乐透的信息，并以JSON格式返回。

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
}`;

// 双色球的AI解析prompt
const SSQ_PROMPT = `你是一个专业的彩票信息提取助手。请从以下OCR识别的文本中提取双色球彩票信息，并以JSON格式返回。

要求：
1. 提取所有可识别的字段
2. 如果某个字段无法识别，可以省略该字段
3. 号码必须是字符串数组（保留前导零，如"08"）
4. 日期格式为 YYYY-MM-DD
5. 金额为数字类型
6. 只返回JSON，不要有其他说明文字

返回格式示例：
{
    "lottery_type": "双色球",
    "issue_number": "2025119",
    "draw_date": "2025-10-16",
    "ticket_type": "单式",
    "total_amount": 10.00,
    "contribution_to_charity": 3.60,
    "serial_numbers": ["E7F0-7F71-2B35-E988"],
    "bets": [
        {
            "sequence": 1,
            "red_balls": ["08", "09", "20", "23", "26", "32"],
            "blue_ball": "01",
            "multiplier": 1
        }
    ],
    "store_info": {
        "station_id": "45013512",
        "transaction_id": "44",
        "address": "上林县巷贤镇万加街"
    },
    "ticket_id": "EFAA602D-D52D1B82",
    "print_time": "2025-10-16 18:10:09",
    "issuer": "中国福利彩票",
    "center": "广西福利彩票发行中心承销"
}`;

// 快乐8的AI解析prompt
const KL8_PROMPT = `你是一个专业的彩票信息提取助手。请从以下OCR识别的文本中提取福彩快乐8彩票信息，并以JSON格式返回。

要求：
1. 提取所有可识别的字段
2. 如果某个字段无法识别，可以省略该字段
3. 号码必须是数字数组
4. 日期格式为 YYYY-MM-DD
5. 金额为数字类型
6. 只返回JSON，不要有其他说明文字

返回格式示例：
{
    "lottery_type": "快乐8-选十单式",
    "issue_number": "2025301",
    "draw_date": "2025-11-11",
    "ticket_type": "单式",
    "total_amount": 2,
    "contribution_to_charity": 0.6,
    "serial_numbers": ["A75-J95E-29X-C75C-L7X74-71503"],
    "bets": [
        {
            "sequence": 1,
            "front_numbers": [8, 10, 18, 20, 29, 44, 49, 68, 70, 71]
        }
    ],
    "store_info": {
        "address": "深圳福彩3199-1号"
    },
    "ticket_id": "A532B84C90B0F4C",
    "print_time": "2025-11-11 19:29:49"
}`;

/**
 * 使用AI解析OCR文本
 */
async function parseWithAI(ocrText: string, lotteryType: string): Promise<any> {
  const prompt =
    lotteryType === "ssq"
      ? SSQ_PROMPT
      : lotteryType === "dlt"
      ? DLT_PROMPT
      : lotteryType === "kl8"
      ? KL8_PROMPT
      : DLT_PROMPT; // 默认使用大乐透

  const fullPrompt = `${prompt}

OCR识别结果：
${ocrText}

请提取信息并返回JSON：`;

  const response = await fetch(`${OCR_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OCR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "Pro/deepseek-ai/DeepSeek-V3.1-Terminus",
      stream: false,
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error("AI parsing failed");
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";
  console.log("AI Response:", content);

  // 提取JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * AI解析接口 - 根据彩票类型解析OCR文本
 */
export async function POST(request: NextRequest) {
  try {
    const { ocrText, lotteryType } = await request.json();

    if (!ocrText) {
      return NextResponse.json(
        { error: "No OCR text provided" },
        { status: 400 }
      );
    }

    if (!lotteryType) {
      return NextResponse.json(
        { error: "No lottery type provided" },
        { status: 400 }
      );
    }

    // 使用AI解析
    const parsedData = await parseWithAI(ocrText, lotteryType);

    return NextResponse.json({
      success: true,
      parsedData,
      lotteryType,
    });
  } catch (error) {
    console.error("Error in AI parsing:", error);
    return NextResponse.json({ error: "AI parsing failed" }, { status: 500 });
  }
}
