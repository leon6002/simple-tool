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
  const apiKey = process.env.OCR_API_KEY;
  const baseUrl = process.env.OCR_BASE_URL || "https://api.siliconflow.cn/v1";

  if (!apiKey) {
    throw new Error("DeepSeek OCR API密钥未配置");
  }

  try {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek OCR API错误:", errorText);
      throw new Error(`DeepSeek OCR识别失败: ${response.statusText}`);
    }

    const data: DeepSeekOCRResponse = await response.json();
    const ocrText = data.choices[0]?.message?.content || "";

    if (!ocrText) {
      throw new Error("未识别到任何文字");
    }

    console.log("DeepSeek OCR识别成功");

    return ocrText;
  } catch (error) {
    console.error("DeepSeek OCR识别错误:", error);
    throw error;
  }
}

