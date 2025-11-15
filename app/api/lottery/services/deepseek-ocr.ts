/**
 * DeepSeek OCR服务
 */

interface DeepSeekOCRResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * 调用DeepSeek OCR接口
 * @param imageBase64 - base64编码的图片（包含data:image前缀）
 * @returns 识别的文本内容
 */
export async function recognizeWithDeepSeekOCR(
  imageBase64: string
): Promise<string> {
  console.log("=== DeepSeek OCR开始 ===");
  const apiKey = process.env.OCR_API_KEY;
  const baseUrl = process.env.OCR_BASE_URL || "https://api.siliconflow.cn/v1";

  if (!apiKey) {
    console.log("❌ DeepSeek OCR API密钥未配置");
    throw new Error("DeepSeek OCR API密钥未配置");
  }

  console.log("1. API配置:", { baseUrl, hasApiKey: !!apiKey });
  console.log("2. 图片数据长度:", imageBase64.length);
  console.log("3. 图片数据前缀:", imageBase64.substring(0, 30));

  try {
    console.log("4. 开始调用 DeepSeek OCR API...");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
                  url: imageBase64,
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

    console.log(
      "5. DeepSeek OCR API响应状态:",
      response.status,
      response.statusText
    );
    console.log("6. 响应Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      console.log("7. 响应不成功，读取错误信息...");
      const errorText = await response.text();
      console.error("❌ DeepSeek OCR API错误响应:", errorText);
      throw new Error(
        `DeepSeek OCR识别失败: ${response.statusText} - ${errorText}`
      );
    }

    console.log("7. 开始解析响应JSON...");
    const data: DeepSeekOCRResponse = await response.json();
    console.log("8. JSON解析成功");

    const ocrText = data.choices[0]?.message?.content || "";

    if (!ocrText) {
      console.log("❌ 未识别到任何文字");
      throw new Error("未识别到任何文字");
    }

    console.log("✅ DeepSeek OCR识别成功");
    console.log("9. 识别文本长度:", ocrText.length);
    console.log("10. 识别文本前100字符:", ocrText.substring(0, 100));

    return ocrText;
  } catch (error) {
    console.error("❌ DeepSeek OCR识别错误:", error);
    console.error(
      "错误堆栈:",
      error instanceof Error ? error.stack : "无堆栈信息"
    );
    throw error;
  } finally {
    console.log("=== DeepSeek OCR结束 ===");
  }
}
