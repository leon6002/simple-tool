import { NextRequest, NextResponse } from "next/server";
import { recognizeText, getOCRProvider } from "../services/ocr-service";

/**
 * OCR文字识别接口 - 只负责从图片中提取文字
 */
export async function POST(request: NextRequest) {
  console.log("=== OCR Text API 开始 ===");
  console.log("请求时间:", new Date().toISOString());
  console.log("请求URL:", request.url);
  console.log("请求方法:", request.method);
  console.log(
    "请求头:",
    JSON.stringify({
      "content-type": request.headers.get("content-type"),
      "content-length": request.headers.get("content-length"),
    })
  );

  try {
    console.log("1. 开始解析请求体...");
    console.log("1.1 请求体是否已被读取:", request.bodyUsed);

    // 检查请求是否已经被读取
    if (request.bodyUsed) {
      console.error("❌ 请求体已经被读取过了！");
      return NextResponse.json(
        {
          error: "Request body already consumed",
          message: "请求体已被读取，这可能是中间件或其他处理器导致的",
        },
        { status: 400 }
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
      console.log("1.2 请求体解析成功");
    } catch (jsonError) {
      console.error("❌ 请求体解析失败:", jsonError);
      console.error(
        "JSON解析错误详情:",
        jsonError instanceof Error ? jsonError.message : "未知错误"
      );
      console.error(
        "JSON解析错误类型:",
        jsonError instanceof Error
          ? jsonError.constructor.name
          : typeof jsonError
      );

      // 检查是否是 Response body 错误
      if (
        jsonError instanceof TypeError &&
        jsonError.message.includes("Response body")
      ) {
        console.error("🔴 在解析请求体时遇到 Response body 错误！");
        console.error("这表明请求对象可能被错误地当作响应对象处理了");
      }

      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          message:
            jsonError instanceof Error ? jsonError.message : "Unknown error",
          errorType:
            jsonError instanceof Error
              ? jsonError.constructor.name
              : typeof jsonError,
        },
        { status: 400 }
      );
    }

    const { image } = requestBody;
    console.log("2. 请求体解析完成");

    if (!image) {
      console.log("❌ 错误：未提供图片数据");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 检查图片格式
    const imagePrefix = image.substring(0, 30);
    console.log("3. 图片数据前缀:", imagePrefix);
    console.log("4. 图片数据总长度:", image.length);

    const provider = getOCRProvider();
    console.log(`5. 使用 ${provider.toUpperCase()} OCR 进行识别`);

    // 调用统一的OCR服务
    console.log("6. 开始调用 OCR 服务...");
    let ocrText: string;
    try {
      ocrText = await recognizeText(image);
      console.log("7. OCR 服务调用完成，文本长度:", ocrText?.length || 0);
    } catch (ocrError) {
      console.error("❌ OCR服务调用失败:", ocrError);
      console.error(
        "OCR错误类型:",
        ocrError instanceof Error ? ocrError.constructor.name : typeof ocrError
      );
      console.error(
        "OCR错误消息:",
        ocrError instanceof Error ? ocrError.message : String(ocrError)
      );
      console.error(
        "OCR错误堆栈:",
        ocrError instanceof Error ? ocrError.stack : "无堆栈"
      );

      // 确保返回 NextResponse
      const errorResponse = NextResponse.json(
        {
          error: "OCR recognition failed",
          message:
            ocrError instanceof Error ? ocrError.message : "Unknown OCR error",
          provider: provider,
        },
        { status: 500 }
      );
      console.log("8. 返回错误响应");
      return errorResponse;
    }

    if (!ocrText) {
      console.log("❌ 错误：未识别到任何文字");
      return NextResponse.json(
        { error: "No text recognized from image" },
        { status: 400 }
      );
    }

    console.log(
      "8. OCR 识别成功，文本长度:",
      ocrText.length,
      "前200字符:",
      ocrText.substring(0, 200)
    );

    // 简单判断彩票类型
    let lotteryType = "unknown";
    if (ocrText.includes("超级大乐透") || ocrText.includes("大乐透")) {
      lotteryType = "dlt";
    } else if (ocrText.includes("双色球")) {
      lotteryType = "ssq";
    } else if (ocrText.includes("快乐8") || ocrText.includes("快乐八")) {
      lotteryType = "kl8";
    }

    console.log("9. 彩票类型判断:", lotteryType);
    console.log("10. 准备返回结果...");

    return NextResponse.json({
      success: true,
      ocrText,
      lotteryType,
      provider, // 返回使用的OCR提供商
    });
  } catch (error) {
    console.error("❌ OCR Text API 顶层错误捕获:", error);
    console.error(
      "错误类型:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "错误消息:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "错误堆栈:",
      error instanceof Error ? error.stack : "无堆栈信息"
    );

    // 特别检查是否是 Response body 错误
    if (error instanceof TypeError && error.message.includes("Response body")) {
      console.error("🔴 检测到 Response body 错误！");
      console.error("这通常意味着 Response 对象被多次读取");
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  } finally {
    console.log("=== OCR Text API 结束 ===");
    console.log("结束时间:", new Date().toISOString());
  }
}
