/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import {
  DLTAIParsedData,
  SSQAIParsedData,
  KL8AIParsedData,
  AutoPrizeResult,
} from "../types";
import { validateFile } from "../utils";

interface OCRProcessorProps {
  onOCRResult: (
    ocrResult: any,
    aiParsedData: DLTAIParsedData | SSQAIParsedData | KL8AIParsedData | null,
    autoPrizeResults: AutoPrizeResult[]
  ) => void;
  lotteryHistoryData: any[];
  ssqHistoryData: any[];
  kl8HistoryData?: any[];
}

export default function OCRProcessor({
  onOCRResult,
  lotteryHistoryData,
  ssqHistoryData,
  kl8HistoryData = [],
}: OCRProcessorProps) {
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [scanningStage, setScanningStage] = useState<
    "idle" | "ocr" | "parsing"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 图片压缩和格式转换函数
  const compressAndConvertImage = useCallback(
    async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // 创建canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("无法创建canvas上下文"));
              return;
            }

            // 计算压缩后的尺寸（保持宽高比）
            let width = img.width;
            let height = img.height;
            const maxDimension = 2048; // 最大边长

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              } else {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;

            // 绘制图片
            ctx.drawImage(img, 0, 0, width, height);

            // 尝试不同的质量级别，直到文件小于1MB
            const tryCompress = (quality: number): string | null => {
              const webpData = canvas.toDataURL("image/webp", quality);
              const sizeInBytes =
                (webpData.length * 3) / 4 -
                (webpData.endsWith("==") ? 2 : webpData.endsWith("=") ? 1 : 0);

              console.log(
                `压缩质量 ${quality}: ${(sizeInBytes / 1024 / 1024).toFixed(
                  2
                )} MB`
              );

              if (sizeInBytes <= 1024 * 1024 || quality <= 0.1) {
                return webpData;
              }
              return null;
            };

            // 从高质量开始尝试
            let result = null;
            for (let q = 0.9; q >= 0.1; q -= 0.1) {
              result = tryCompress(q);
              if (result) break;
            }

            if (result) {
              console.log(
                `图片已转换为WebP格式并压缩到1MB以内 (${width}x${height})`
              );
              resolve(result);
            } else {
              reject(new Error("无法将图片压缩到1MB以内"));
            }
          };

          img.onerror = () => {
            reject(new Error("图片加载失败"));
          };

          img.src = e.target?.result as string;
        };

        reader.onerror = () => {
          reject(new Error("文件读取失败"));
        };

        reader.readAsDataURL(file);
      });
    },
    []
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        console.error(validationError);
        return;
      }

      setOcrLoading(true);
      setScanningStage("idle");

      try {
        // 压缩和转换图片
        console.log(
          `原始图片: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(
            2
          )} MB, 格式: ${file.type}`
        );
        const compressedBase64 = await compressAndConvertImage(file);
        setOcrImage(compressedBase64);

        // 第一步：OCR文字识别
        setScanningStage("ocr");
        console.log("正在识别图片文字...");
        const ocrResponse = await fetch("/api/lottery/ocr-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: compressedBase64,
          }),
        });

        if (!ocrResponse.ok) {
          throw new Error("OCR识别失败");
        }

        const ocrData = await ocrResponse.json();

        if (!ocrData.success || !ocrData.ocrText) {
          console.error("未能识别出文字");
          return;
        }

        console.log(
          `识别成功！检测到${
            ocrData.lotteryType === "dlt"
              ? "大乐透"
              : ocrData.lotteryType === "ssq"
              ? "双色球"
              : ocrData.lotteryType === "kl8"
              ? "快乐8"
              : "未知类型"
          }彩票`
        );

        // 第二步：AI解析
        setScanningStage("parsing");
        console.log("正在AI解析识别结果...");
        const parseResponse = await fetch("/api/lottery/parse-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ocrText: ocrData.ocrText,
            lotteryType: ocrData.lotteryType,
          }),
        });

        if (!parseResponse.ok) {
          throw new Error("AI解析失败");
        }

        const parseData = await parseResponse.json();
        console.log("AI Response:", JSON.stringify(parseData, null, 2));

        if (!parseData.success || !parseData.parsedData) {
          console.error("AI解析失败，返回数据:", parseData);
          return;
        }

        console.log("解析成功！");
        setScanningStage("idle");

        // 设置解析结果
        const aiData = parseData.parsedData;
        let entries: Array<{ numbers: number[]; specialNumbers: number[] }> =
          [];

        if (parseData.lotteryType === "dlt") {
          const dltData = aiData as DLTAIParsedData;
          entries = dltData.bets.map((bet) => ({
            numbers: bet.front_numbers,
            specialNumbers: bet.back_numbers,
          }));
        } else if (parseData.lotteryType === "ssq") {
          const ssqData = aiData as SSQAIParsedData;
          entries = ssqData.bets.map((bet) => ({
            numbers: bet.red_balls.map((n) => parseInt(n)),
            specialNumbers: [parseInt(bet.blue_ball)],
          }));
        } else if (parseData.lotteryType === "kl8") {
          const kl8Data = aiData as KL8AIParsedData;
          entries = kl8Data.bets.map((bet) => ({
            numbers: bet.front_numbers,
            specialNumbers: [],
          }));
        }

        const parsedResult = {
          type: parseData.lotteryType,
          issueNumber: aiData.issue_number || null,
          drawDate: aiData.draw_date || null,
          totalCost: aiData.total_amount || null,
          entries,
        };

        // 自动计算奖金
        const autoPrizeResults = await calculateAutoPrizes(
          entries,
          aiData.issue_number,
          parseData.lotteryType,
          lotteryHistoryData,
          ssqHistoryData,
          kl8HistoryData
        );

        onOCRResult(parsedResult, aiData, autoPrizeResults);
      } catch (error) {
        console.error("OCR error:", error);
        console.error("图片识别失败，请重试");
        setScanningStage("idle");
      } finally {
        setOcrLoading(false);
      }
    },
    [
      compressAndConvertImage,
      onOCRResult,
      lotteryHistoryData,
      ssqHistoryData,
      kl8HistoryData,
    ]
  );

  const calculateAutoPrizes = async (
    ocrEntries: Array<{ numbers: number[]; specialNumbers: number[] }>,
    issueNumber: string | null,
    lotteryType: string,
    dltHistoryData: any[],
    ssqHistoryData: any[],
    kl8HistoryData: any[]
  ): Promise<AutoPrizeResult[]> => {
    if (!issueNumber) return [];

    let historyData: any[];
    if (lotteryType === "ssq") {
      historyData = ssqHistoryData;
    } else if (lotteryType === "kl8") {
      historyData = kl8HistoryData;
    } else {
      historyData = dltHistoryData;
    }

    if (historyData.length === 0) return [];

    let winningMainNumbers: number[] = [];
    let winningSpecialNumbers: number[] = [];

    if (lotteryType === "ssq") {
      const ssqDraw = ssqHistoryData.find(
        (draw) =>
          draw.issue === issueNumber || draw.issue.endsWith(issueNumber!)
      );
      if (!ssqDraw) return [];
      winningMainNumbers = ssqDraw.redBalls.map((n: string) => parseInt(n));
      winningSpecialNumbers = [parseInt(ssqDraw.blueBall)];
    } else if (lotteryType === "kl8") {
      console.log("快乐8自动计算奖金 - 期号:", issueNumber);
      console.log(
        "快乐8历史数据:",
        kl8HistoryData.map((d) => d.issue)
      );

      const kl8Draw = kl8HistoryData.find(
        (draw) =>
          draw.issue === issueNumber || draw.issue.endsWith(issueNumber!)
      );

      console.log("找到的快乐8开奖数据:", kl8Draw);

      if (!kl8Draw) return [];

      // 确保转换为数字数组
      winningMainNumbers = (kl8Draw.numbers || []).map((n: any) =>
        typeof n === "string" ? parseInt(n, 10) : n
      );
      winningSpecialNumbers = [];

      console.log("快乐8开奖号码（数字）:", winningMainNumbers);
    } else {
      let dltDraw = dltHistoryData.find((draw) => draw.issue === issueNumber);
      if (!dltDraw && issueNumber.length === 5) {
        dltDraw = dltHistoryData.find((draw) =>
          draw.issue.endsWith(issueNumber)
        );
      }
      if (!dltDraw && issueNumber) {
        const shortIssue = issueNumber.slice(-5);
        dltDraw = dltHistoryData.find((draw) =>
          draw.issue.endsWith(shortIssue)
        );
      }
      if (!dltDraw) return [];
      winningMainNumbers = dltDraw.numbers.map((n: number) => n);
      winningSpecialNumbers = dltDraw.specialNumbers.map((n: number) => n);
    }

    return ocrEntries.map((entry, index) => {
      const matchedMainNumbers = entry.numbers.filter((num) =>
        winningMainNumbers.includes(num)
      );
      const matchedSpecialNumbers = entry.specialNumbers.filter((num) =>
        winningSpecialNumbers.includes(num)
      );

      const matchedMain = matchedMainNumbers.length;
      const matchedSpecial = matchedSpecialNumbers.length;

      if (lotteryType === "kl8") {
        console.log(`第${index + 1}注 - 投注号码:`, entry.numbers);
        console.log(`第${index + 1}注 - 开奖号码:`, winningMainNumbers);
        console.log(`第${index + 1}注 - 匹配号码:`, matchedMainNumbers);
        console.log(`第${index + 1}注 - 匹配数量:`, matchedMain);
      }

      let prize = "";

      if (lotteryType === "dlt") {
        if (matchedMain === 5 && matchedSpecial === 2)
          prize = "一等奖（浮动奖金）";
        else if (matchedMain === 5 && matchedSpecial === 1)
          prize = "二等奖（浮动奖金）";
        else if (matchedMain === 5 && matchedSpecial === 0)
          prize = "三等奖（10,000元）";
        else if (matchedMain === 4 && matchedSpecial === 2)
          prize = "四等奖（3,000元）";
        else if (matchedMain === 4 && matchedSpecial === 1)
          prize = "五等奖（300元）";
        else if (
          (matchedMain === 3 && matchedSpecial === 2) ||
          (matchedMain === 4 && matchedSpecial === 0)
        )
          prize = "六等奖（200元）";
        else if (
          (matchedMain === 3 && matchedSpecial === 1) ||
          (matchedMain === 2 && matchedSpecial === 2)
        )
          prize = "七等奖（100元）";
        else if (
          (matchedMain === 3 && matchedSpecial === 0) ||
          (matchedMain === 1 && matchedSpecial === 2) ||
          (matchedMain === 2 && matchedSpecial === 1) ||
          (matchedMain === 0 && matchedSpecial === 2)
        )
          prize = "八等奖（15元）";
        else prize = "未中奖";
      } else if (lotteryType === "ssq") {
        if (matchedMain === 6 && matchedSpecial === 1)
          prize = "一等奖（浮动奖金）";
        else if (matchedMain === 6 && matchedSpecial === 0)
          prize = "二等奖（浮动奖金）";
        else if (matchedMain === 5 && matchedSpecial === 1)
          prize = "三等奖（3,000元）";
        else if (
          (matchedMain === 5 && matchedSpecial === 0) ||
          (matchedMain === 4 && matchedSpecial === 1)
        )
          prize = "四等奖（200元）";
        else if (
          (matchedMain === 4 && matchedSpecial === 0) ||
          (matchedMain === 3 && matchedSpecial === 1)
        )
          prize = "五等奖（10元）";
        else if (
          (matchedMain === 2 && matchedSpecial === 1) ||
          (matchedMain === 1 && matchedSpecial === 1) ||
          (matchedMain === 0 && matchedSpecial === 1)
        )
          prize = "六等奖（5元）";
        else prize = "未中奖";
      } else if (lotteryType === "kl8") {
        // 快乐8奖金计算（选十玩法）
        const selectedCount = entry.numbers.length;
        const kl8PrizeRules: { [key: number]: { [key: number]: string } } = {
          10: {
            10: "浮动奖金",
            9: "8,000元",
            8: "800元",
            7: "80元",
            6: "5元",
            5: "3元",
            0: "2元",
          },
        };

        const rules = kl8PrizeRules[selectedCount];
        if (rules && rules[matchedMain]) {
          prize = rules[matchedMain];
        } else {
          prize = "未中奖";
        }
      }

      return {
        betIndex: index,
        matchedMain,
        matchedSpecial,
        prize,
        matchedMainNumbers,
        matchedSpecialNumbers,
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          彩票照片识别
        </CardTitle>
        <CardDescription>上传彩票照片，自动识别号码并计算奖金</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Label
            htmlFor="lottery-upload"
            className="shrink-0 cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Upload className="h-4 w-4" />
            {ocrLoading ? "识别中..." : "选择图片"}
          </Label>
          <input
            id="lottery-upload"
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            disabled={ocrLoading}
            className="hidden"
          />
          {ocrLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
          )}
          {ocrImage && !ocrLoading && (
            <span className="text-sm text-muted-foreground">图片已上传</span>
          )}
        </div>

        {/* 图片预览和扫描动画 */}
        {ocrImage && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              预览图片：
            </p>
            <div className="relative w-full max-w-[320px] mx-auto overflow-hidden rounded-lg">
              <img
                src={ocrImage}
                alt="Uploaded lottery ticket"
                className="w-full h-auto rounded-lg border border-border shadow-md"
              />

              {/* 扫描动画覆盖层 */}
              {scanningStage !== "idle" && (
                <>
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ overflow: "hidden" }}
                  >
                    <motion.div
                      className="absolute left-0 right-0 h-80 bg-linear-to-b from-transparent via-white/10 to-transparent"
                      style={{
                        boxShadow: "0 0px 30px rgba(255, 255, 255, 0.5)",
                      }}
                      initial={{ y: "-100%" }}
                      animate={{ y: "150%" }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/50 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full mx-auto mb-3"
                      />
                      <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg">
                        {scanningStage === "ocr"
                          ? "AI识别中..."
                          : "已识别，AI解析中..."}
                      </p>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
