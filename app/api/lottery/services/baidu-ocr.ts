/**
 * 百度OCR服务
 * 文档: https://ai.baidu.com/ai-doc/OCR/zk3h7xz52
 */

interface BaiduTokenResponse {
  access_token: string;
  expires_in: number;
}

interface BaiduOCRWord {
  words: string;
}

interface BaiduOCRResponse {
  words_result: BaiduOCRWord[];
  words_result_num: number;
}

// 缓存access_token（内存缓存，生产环境建议使用Redis）
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 获取百度OCR的access_token
 */
async function getBaiduAccessToken(): Promise<string> {
  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("百度OCR API密钥未配置");
  }

  // 如果token还在有效期内，直接返回
  const now = Date.now();
  if (cachedToken && tokenExpireTime > now) {
    return cachedToken;
  }

  // 获取新token
  const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`获取百度OCR token失败: ${response.statusText}`);
  }

  const data: BaiduTokenResponse = await response.json();

  // 缓存token（提前5分钟过期）
  cachedToken = data.access_token;
  tokenExpireTime = now + (data.expires_in - 300) * 1000;

  return cachedToken;
}

/**
 * 调用百度通用文字识别接口
 * @param imageBase64 - base64编码的图片（不包含data:image前缀）
 * @returns 识别的文本内容
 */
export async function recognizeWithBaiduOCR(
  imageBase64: string
): Promise<string> {
  try {
    // 获取access_token
    const accessToken = await getBaiduAccessToken();

    // 移除base64前缀（如果有）
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // 调用OCR接口
    const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token=${accessToken}`;

    const formData = new URLSearchParams();
    formData.append("image", base64Data);
    formData.append("detect_direction", "false");
    formData.append("detect_language", "false");
    formData.append("vertexes_location", "false");
    formData.append("paragraph", "false");
    formData.append("probability", "false");

    const response = await fetch(ocrUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("百度OCR API错误:", errorText);
      throw new Error(`百度OCR识别失败: ${response.statusText}`);
    }

    const data: BaiduOCRResponse = await response.json();

    if (!data.words_result || data.words_result.length === 0) {
      throw new Error("未识别到任何文字");
    }

    // 将所有识别的文字拼接成一个字符串
    const ocrText = data.words_result.map((item) => item.words).join("\n");

    console.log(`百度OCR识别成功，共识别${data.words_result_num}行文字`);

    return ocrText;
  } catch (error) {
    console.error("百度OCR识别错误:", error);
    throw error;
  }
}

