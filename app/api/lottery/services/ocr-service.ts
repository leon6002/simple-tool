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

  console.log("=== OCR Service 开始 ===");
  console.log(`使用 ${provider.toUpperCase()} OCR 进行识别`);
  console.log("图片数据长度:", imageBase64.length);

  try {
    console.log(`调用 ${provider.toUpperCase()} OCR...`);
    let result;

    if (provider === "baidu") {
      result = await recognizeWithBaiduOCR(imageBase64);
    } else {
      result = await recognizeWithDeepSeekOCR(imageBase64);
    }

    console.log(`${provider.toUpperCase()} OCR 识别成功`);
    console.log("=== OCR Service 结束 ===");
    return result;
  } catch (error) {
    console.error(`❌ ${provider.toUpperCase()} OCR 识别失败:`, error);
    console.error(
      "错误类型:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "错误消息:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("错误堆栈:", error instanceof Error ? error.stack : "无堆栈");

    // 如果主OCR失败，尝试使用备用OCR
    if (provider === "baidu") {
      console.log("⚠️ 尝试使用 DeepSeek OCR 作为备用");
      try {
        const fallbackResult = await recognizeWithDeepSeekOCR(imageBase64);
        console.log("✅ 备用 DeepSeek OCR 识别成功");
        console.log("=== OCR Service 结束 ===");
        return fallbackResult;
      } catch (fallbackError) {
        console.error("❌ 备用 DeepSeek OCR 也失败:", fallbackError);
        console.error(
          "备用错误类型:",
          fallbackError instanceof Error
            ? fallbackError.constructor.name
            : typeof fallbackError
        );
        console.error(
          "备用错误消息:",
          fallbackError instanceof Error
            ? fallbackError.message
            : String(fallbackError)
        );
        console.log("=== OCR Service 结束（失败）===");
        throw error; // 抛出原始错误
      }
    } else {
      console.log("⚠️ 尝试使用百度OCR作为备用");
      try {
        const fallbackResult = await recognizeWithBaiduOCR(imageBase64);
        console.log("✅ 备用百度OCR识别成功");
        console.log("=== OCR Service 结束 ===");
        return fallbackResult;
      } catch (fallbackError) {
        console.error("❌ 备用百度OCR也失败:", fallbackError);
        console.error(
          "备用错误类型:",
          fallbackError instanceof Error
            ? fallbackError.constructor.name
            : typeof fallbackError
        );
        console.error(
          "备用错误消息:",
          fallbackError instanceof Error
            ? fallbackError.message
            : String(fallbackError)
        );
        console.log("=== OCR Service 结束（失败）===");
        throw error; // 抛出原始错误
      }
    }
  }
}
