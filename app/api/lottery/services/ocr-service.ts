/**
 * OCR服务统一入口
 * 根据配置选择使用百度OCR或DeepSeek OCR
 */

import { recognizeWithBaiduOCR } from "./baidu-ocr";
import { recognizeWithDeepSeekOCR } from "./deepseek-ocr";

export type OCRProvider = "baidu" | "deepseek";

/**
 * 获取当前配置的OCR提供商
 */
export function getOCRProvider(): OCRProvider {
  const provider = process.env.OCR_PROVIDER?.toLowerCase();
  return provider === "deepseek" ? "deepseek" : "baidu"; // 默认使用百度
}

/**
 * 统一的OCR识别接口
 * @param imageBase64 - base64编码的图片
 * @returns 识别的文本内容
 */
export async function recognizeText(imageBase64: string): Promise<string> {
  const provider = getOCRProvider();

  console.log(`使用 ${provider.toUpperCase()} OCR 进行识别`);

  try {
    if (provider === "baidu") {
      return await recognizeWithBaiduOCR(imageBase64);
    } else {
      return await recognizeWithDeepSeekOCR(imageBase64);
    }
  } catch (error) {
    console.error(`${provider.toUpperCase()} OCR 识别失败:`, error);

    // 如果主OCR失败，尝试使用备用OCR
    if (provider === "baidu") {
      console.log("尝试使用 DeepSeek OCR 作为备用");
      try {
        return await recognizeWithDeepSeekOCR(imageBase64);
      } catch (fallbackError) {
        console.error("备用OCR也失败:", fallbackError);
        throw error; // 抛出原始错误
      }
    } else {
      console.log("尝试使用百度OCR作为备用");
      try {
        return await recognizeWithBaiduOCR(imageBase64);
      } catch (fallbackError) {
        console.error("备用OCR也失败:", fallbackError);
        throw error; // 抛出原始错误
      }
    }
  }
}

