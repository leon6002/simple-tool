"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Ticket,
  Calculator,
  Sparkles,
  Upload,
  Shuffle,
  Copy,
  Check,
  Loader2,
  History,
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import toast from "react-hot-toast";
import { ParseResult, LotteryResult } from "@/lib/utils/lottery";

interface AIParsedLotteryData {
  lottery_type: string;
  issue_number: string;
  draw_date: string;
  ticket_type: string;
  multiple: number;
  total_amount: number;
  contribution_to_charity: number;
  serial_numbers: string[];
  bets: Array<{
    sequence: number;
    front_numbers: number[];
    back_numbers: number[];
  }>;
  prize_pool?: number;
  previous_jackpot?: number;
  store_info?: {
    name: string;
    address: string;
  };
  ticket_id?: string;
  print_time?: string;
}

type LotteryType = "dlt" | "ssq" | "fc8";

interface LotteryConfig {
  name: string;
  mainRange: [number, number];
  mainCount: number;
  specialRange?: [number, number];
  specialCount?: number;
  description: string;
}

const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  dlt: {
    name: "大乐透",
    mainRange: [1, 35],
    mainCount: 5,
    specialRange: [1, 12],
    specialCount: 2,
    description: "前区5个号码(1-35) + 后区2个号码(1-12)",
  },
  ssq: {
    name: "双色球",
    mainRange: [1, 33],
    mainCount: 6,
    specialRange: [1, 16],
    specialCount: 1,
    description: "红球6个号码(1-33) + 蓝球1个号码(1-16)",
  },
  fc8: {
    name: "福彩8",
    mainRange: [1, 80],
    mainCount: 8,
    description: "选择8个号码(1-80)",
  },
};

export default function LotteryPage() {
  const { addRecentlyUsedTool } = useUserPreferencesStore();
  const [selectedType, setSelectedType] = useState<LotteryType>("dlt");
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [generatedSpecialNumbers, setGeneratedSpecialNumbers] = useState<
    number[]
  >([]);
  const [copied, setCopied] = useState(false);

  // OCR states
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<ParseResult | null>(null);
  const [aiParsedData, setAiParsedData] = useState<AIParsedLotteryData | null>(
    null
  );

  // Prize calculator states
  const [matchedMain, setMatchedMain] = useState<number>(0);
  const [matchedSpecial, setMatchedSpecial] = useState<number>(0);
  const [calculatedPrize, setCalculatedPrize] = useState<string>("");

  // Auto-calculated prize results for OCR
  const [autoPrizeResults, setAutoPrizeResults] = useState<
    Array<{
      betIndex: number;
      matchedMain: number;
      matchedSpecial: number;
      prize: string;
      matchedMainNumbers: number[]; // 命中的前区号码
      matchedSpecialNumbers: number[]; // 命中的后区号码
    }>
  >([]);

  // History states
  const [historyData, setHistoryData] = useState<LotteryResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    addRecentlyUsedTool("lottery");
  }, [addRecentlyUsedTool]);

  // Fetch lottery history on mount
  useEffect(() => {
    fetchLotteryHistory();
  }, []);

  const fetchLotteryHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/lottery/history");
      const data = await response.json();

      console.log("Lottery history API response:", data);

      if (data.success && data.data) {
        setHistoryData(data.data);
        console.log("History data loaded:", data.data.length, "records");
        console.log(
          "Sample issues:",
          data.data.slice(0, 5).map((d: { issue: string }) => d.issue)
        );
      } else {
        toast.error("获取开奖数据失败");
      }
    } catch (error) {
      console.error("获取开奖数据失败:", error);
      toast.error("获取开奖数据失败");
    } finally {
      setHistoryLoading(false);
    }
  };

  const config = LOTTERY_CONFIGS[selectedType];

  // Generate random lottery numbers
  const generateNumbers = useCallback(() => {
    const mainNumbers: number[] = [];
    const specialNumbers: number[] = [];

    // Generate main numbers
    while (mainNumbers.length < config.mainCount) {
      const num =
        Math.floor(
          Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)
        ) + config.mainRange[0];
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num);
      }
    }
    mainNumbers.sort((a, b) => a - b);

    // Generate special numbers if applicable
    if (config.specialRange && config.specialCount) {
      while (specialNumbers.length < config.specialCount) {
        const num =
          Math.floor(
            Math.random() *
              (config.specialRange[1] - config.specialRange[0] + 1)
          ) + config.specialRange[0];
        if (!specialNumbers.includes(num)) {
          specialNumbers.push(num);
        }
      }
      specialNumbers.sort((a, b) => a - b);
    }

    setGeneratedNumbers(mainNumbers);
    setGeneratedSpecialNumbers(specialNumbers);
    toast.success("号码生成成功！");
  }, [config]);

  // Copy numbers to clipboard
  const copyNumbers = useCallback(() => {
    const text =
      generatedSpecialNumbers.length > 0
        ? `${generatedNumbers.join(", ")} + ${generatedSpecialNumbers.join(
            ", "
          )}`
        : generatedNumbers.join(", ");

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  }, [generatedNumbers, generatedSpecialNumbers]);

  // Auto calculate prizes for OCR results
  const autoCalculatePrizes = useCallback(
    (
      ocrEntries: Array<{ numbers: number[]; specialNumbers: number[] }>,
      issueNumber: string | null
    ) => {
      console.log("autoCalculatePrizes called with:", {
        issueNumber,
        historyDataLength: historyData.length,
        ocrEntriesLength: ocrEntries.length,
      });

      if (!issueNumber || historyData.length === 0) {
        console.log("Missing issueNumber or historyData");
        toast.error("无法自动计算：缺少期号或开奖数据");
        return;
      }

      // Find the winning numbers for the issue
      console.log("Searching for issue:", issueNumber);
      console.log(
        "Available issues:",
        historyData.map((d) => d.issue)
      );

      // Try to find exact match first, then try partial match
      let winningDraw = historyData.find((draw) => draw.issue === issueNumber);

      // If not found, try matching the last 5 digits (e.g., "25092" matches "2025092")
      if (!winningDraw && issueNumber.length === 5) {
        winningDraw = historyData.find((draw) =>
          draw.issue.endsWith(issueNumber)
        );
        console.log("Trying partial match, found:", winningDraw);
      }

      // If still not found, try matching without year prefix
      if (!winningDraw) {
        const shortIssue = issueNumber.slice(-5); // Get last 5 digits
        winningDraw = historyData.find((draw) =>
          draw.issue.endsWith(shortIssue)
        );
        console.log("Trying short issue match, found:", winningDraw);
      }

      if (!winningDraw) {
        console.log("Winning draw not found for issue:", issueNumber);
        toast.error(`未找到第 ${issueNumber} 期的开奖数据`);
        return;
      }

      console.log("Found winning draw:", winningDraw);

      const results = ocrEntries.map((entry, index) => {
        // Count matched numbers (convert string to number for comparison)
        const winningMainNumbers = winningDraw.numbers.map((n) => parseInt(n));
        const winningSpecialNumbers = winningDraw.specialNumbers.map((n) =>
          parseInt(n)
        );

        // Find which numbers matched
        const matchedMainNumbers = entry.numbers.filter((num) =>
          winningMainNumbers.includes(num)
        );
        const matchedSpecialNumbers = entry.specialNumbers.filter((num) =>
          winningSpecialNumbers.includes(num)
        );

        const matchedMain = matchedMainNumbers.length;
        const matchedSpecial = matchedSpecialNumbers.length;

        // Calculate prize based on lottery type
        let prize = "";
        const lotteryType = ocrResult?.type || "dlt";

        if (lotteryType === "dlt") {
          if (matchedMain === 5 && matchedSpecial === 2) {
            prize = "一等奖（浮动奖金）";
          } else if (matchedMain === 5 && matchedSpecial === 1) {
            prize = "二等奖（浮动奖金）";
          } else if (matchedMain === 5 && matchedSpecial === 0) {
            prize = "三等奖（10,000元）";
          } else if (matchedMain === 4 && matchedSpecial === 2) {
            prize = "四等奖（3,000元）";
          } else if (matchedMain === 4 && matchedSpecial === 1) {
            prize = "五等奖（300元）";
          } else if (
            (matchedMain === 3 && matchedSpecial === 2) ||
            (matchedMain === 4 && matchedSpecial === 0)
          ) {
            prize = "六等奖（200元）";
          } else if (
            (matchedMain === 3 && matchedSpecial === 1) ||
            (matchedMain === 2 && matchedSpecial === 2)
          ) {
            prize = "七等奖（100元）";
          } else if (
            (matchedMain === 3 && matchedSpecial === 0) ||
            (matchedMain === 1 && matchedSpecial === 2) ||
            (matchedMain === 2 && matchedSpecial === 1) ||
            (matchedMain === 0 && matchedSpecial === 2)
          ) {
            prize = "八等奖（15元）";
          } else {
            prize = "未中奖";
          }
        } else if (lotteryType === "ssq") {
          if (matchedMain === 6 && matchedSpecial === 1) {
            prize = "一等奖（浮动奖金）";
          } else if (matchedMain === 6 && matchedSpecial === 0) {
            prize = "二等奖（浮动奖金）";
          } else if (matchedMain === 5 && matchedSpecial === 1) {
            prize = "三等奖（3,000元）";
          } else if (
            (matchedMain === 5 && matchedSpecial === 0) ||
            (matchedMain === 4 && matchedSpecial === 1)
          ) {
            prize = "四等奖（200元）";
          } else if (
            (matchedMain === 4 && matchedSpecial === 0) ||
            (matchedMain === 3 && matchedSpecial === 1)
          ) {
            prize = "五等奖（10元）";
          } else if (
            (matchedMain === 2 && matchedSpecial === 1) ||
            (matchedMain === 1 && matchedSpecial === 1) ||
            (matchedMain === 0 && matchedSpecial === 1)
          ) {
            prize = "六等奖（5元）";
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

      setAutoPrizeResults(results);

      // Show summary toast
      const winningBets = results.filter((r) => r.prize !== "未中奖");
      if (winningBets.length > 0) {
        toast.success(`恭喜！有 ${winningBets.length} 注中奖！`);
      } else {
        toast("很遗憾，本次未中奖");
      }
    },
    [historyData, ocrResult]
  );

  // Handle image upload for OCR
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("请上传图片文件");
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("图片大小不能超过10MB");
        return;
      }

      setOcrLoading(true);

      try {
        // Convert to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          setOcrImage(base64);

          // Call OCR API
          const response = await fetch("/api/lottery/ocr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageBase64: base64,
            }),
          });

          if (!response.ok) {
            throw new Error("OCR识别失败");
          }

          const data = await response.json();
          console.log("OCR API response:", data);

          if (data.success && data.parsedResult) {
            setOcrResult(data.parsedResult);
            setAiParsedData(data.aiParsedResult || null);
            toast.success("识别成功！");

            // Auto calculate prizes
            if (
              data.parsedResult.entries &&
              data.parsedResult.entries.length > 0
            ) {
              console.log("Calling autoCalculatePrizes with:", {
                entries: data.parsedResult.entries,
                issueNumber: data.parsedResult.issueNumber,
              });
              autoCalculatePrizes(
                data.parsedResult.entries,
                data.parsedResult.issueNumber
              );
            } else {
              console.log("No entries found in parsed result");
            }
          } else {
            toast.error("未能识别出彩票号码");
          }
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("OCR error:", error);
        toast.error("图片识别失败，请重试");
      } finally {
        setOcrLoading(false);
      }
    },
    [autoCalculatePrizes]
  );

  // Calculate prize based on matched numbers
  const calculatePrize = useCallback(() => {
    let prize = "";

    if (selectedType === "dlt") {
      if (matchedMain === 5 && matchedSpecial === 2) {
        prize = "一等奖（浮动奖金）";
      } else if (matchedMain === 5 && matchedSpecial === 1) {
        prize = "二等奖（浮动奖金）";
      } else if (matchedMain === 5 && matchedSpecial === 0) {
        prize = "三等奖（10,000元）";
      } else if (matchedMain === 4 && matchedSpecial === 2) {
        prize = "四等奖（3,000元）";
      } else if (matchedMain === 4 && matchedSpecial === 1) {
        prize = "五等奖（300元）";
      } else if (
        (matchedMain === 3 && matchedSpecial === 2) ||
        (matchedMain === 4 && matchedSpecial === 0)
      ) {
        prize = "六等奖（200元）";
      } else if (
        (matchedMain === 3 && matchedSpecial === 1) ||
        (matchedMain === 2 && matchedSpecial === 2)
      ) {
        prize = "七等奖（100元）";
      } else if (
        (matchedMain === 3 && matchedSpecial === 0) ||
        (matchedMain === 1 && matchedSpecial === 2) ||
        (matchedMain === 2 && matchedSpecial === 1) ||
        (matchedMain === 0 && matchedSpecial === 2)
      ) {
        prize = "八等奖（15元）";
      } else {
        prize = "未中奖";
      }
    } else if (selectedType === "ssq") {
      if (matchedMain === 6 && matchedSpecial === 1) {
        prize = "一等奖（浮动奖金）";
      } else if (matchedMain === 6 && matchedSpecial === 0) {
        prize = "二等奖（浮动奖金）";
      } else if (matchedMain === 5 && matchedSpecial === 1) {
        prize = "三等奖（3,000元）";
      } else if (
        (matchedMain === 5 && matchedSpecial === 0) ||
        (matchedMain === 4 && matchedSpecial === 1)
      ) {
        prize = "四等奖（200元）";
      } else if (
        (matchedMain === 4 && matchedSpecial === 0) ||
        (matchedMain === 3 && matchedSpecial === 1)
      ) {
        prize = "五等奖（10元）";
      } else if (
        (matchedMain === 2 && matchedSpecial === 1) ||
        (matchedMain === 1 && matchedSpecial === 1) ||
        (matchedMain === 0 && matchedSpecial === 1)
      ) {
        prize = "六等奖（5元）";
      } else {
        prize = "未中奖";
      }
    }

    setCalculatedPrize(prize);
    if (prize !== "未中奖") {
      toast.success(`恭喜中奖：${prize}`);
    } else {
      toast("未中奖，再接再厉！");
    }
  }, [selectedType, matchedMain, matchedSpecial]);

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <Ticket className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            彩票工具
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            提供彩票奖金计算和号码生成功能
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              奖金计算
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              号码生成器
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              开奖历史
            </TabsTrigger>
          </TabsList>

          {/* Prize Calculator Tab */}
          <TabsContent value="calculator">
            <div className="space-y-6">
              {/* Lottery Type Selection */}
              <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                <CardHeader>
                  <CardTitle>选择彩票类型</CardTitle>
                  <CardDescription>支持大乐透、双色球、福彩8</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map(
                      (type) => (
                        <Button
                          key={type}
                          variant={
                            selectedType === type ? "default" : "outline"
                          }
                          onClick={() => setSelectedType(type)}
                          className={
                            selectedType === type
                              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                              : ""
                          }
                        >
                          {LOTTERY_CONFIGS[type].name}
                        </Button>
                      )
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {config.description}
                  </p>
                </CardContent>
              </Card>

              {/* OCR Upload */}
              <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    彩票照片识别
                  </CardTitle>
                  <CardDescription>上传彩票照片，自动识别号码</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label
                      htmlFor="lottery-upload"
                      className="flex-shrink-0 cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      <Upload className="h-4 w-4" />
                      {ocrLoading ? "识别中..." : "选择图片"}
                    </Label>
                    <Input
                      id="lottery-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={ocrLoading}
                      className="hidden"
                    />
                    {ocrLoading && (
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    )}
                    {ocrImage && !ocrLoading && (
                      <span className="text-sm text-muted-foreground">
                        图片已上传
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ocrImage && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          预览图片：
                        </p>
                        <div className="relative w-full max-w-xs">
                          <img
                            src={ocrImage}
                            alt="Uploaded lottery ticket"
                            className="w-full h-auto rounded-lg border border-border shadow-md"
                          />
                        </div>
                      </div>
                    )}

                    {ocrResult && (
                      <div className="space-y-4 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          识别结果：
                        </p>

                        {/* 彩票信息卡片 */}
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                期数
                              </p>
                              <p className="font-semibold text-sm">
                                {ocrResult.issueNumber || "未识别"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                开奖日期
                              </p>
                              <p className="font-semibold text-sm">
                                {ocrResult.drawDate || "未识别"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                成本
                              </p>
                              <p className="font-semibold text-sm">
                                {ocrResult.totalCost !== null
                                  ? `${ocrResult.totalCost}元`
                                  : "未识别"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 开奖号码显示 */}
                        {ocrResult.issueNumber &&
                          (() => {
                            // Find the winning draw for this issue
                            let winningDraw = historyData.find(
                              (draw) => draw.issue === ocrResult.issueNumber
                            );

                            // Try partial match if not found
                            if (
                              !winningDraw &&
                              ocrResult.issueNumber &&
                              ocrResult.issueNumber.length === 5
                            ) {
                              winningDraw = historyData.find((draw) =>
                                draw.issue.endsWith(ocrResult.issueNumber!)
                              );
                            }

                            if (!winningDraw && ocrResult.issueNumber) {
                              const shortIssue =
                                ocrResult.issueNumber.slice(-5);
                              winningDraw = historyData.find((draw) =>
                                draw.issue.endsWith(shortIssue)
                              );
                            }

                            if (winningDraw) {
                              return (
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 text-center">
                                    第 {winningDraw.issue} 期开奖号码
                                  </p>
                                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                                    {winningDraw.numbers.map((num, idx) => (
                                      <div
                                        key={idx}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                      >
                                        {num}
                                      </div>
                                    ))}
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400 mx-1">
                                      +
                                    </span>
                                    {winningDraw.specialNumbers.map(
                                      (num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                        >
                                          {num}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                        {/* AI解析的额外信息 */}
                        {aiParsedData && (
                          <div className="space-y-3">
                            {/* 彩票类型和票据信息 */}
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    彩票类型：
                                  </span>
                                  <span className="font-medium ml-1">
                                    {aiParsedData.lottery_type}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    票据类型：
                                  </span>
                                  <span className="font-medium ml-1">
                                    {aiParsedData.ticket_type}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    倍数：
                                  </span>
                                  <span className="font-medium ml-1">
                                    {aiParsedData.multiple}倍
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    公益金：
                                  </span>
                                  <span className="font-medium ml-1">
                                    {aiParsedData.contribution_to_charity}元
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 奖池和店铺信息 */}
                            {(aiParsedData.prize_pool ||
                              aiParsedData.store_info) && (
                              <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="space-y-2 text-sm">
                                  {aiParsedData.prize_pool && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        奖池金额：
                                      </span>
                                      <span className="font-medium ml-1">
                                        {(
                                          aiParsedData.prize_pool / 100000000
                                        ).toFixed(2)}
                                        亿元
                                      </span>
                                    </div>
                                  )}
                                  {aiParsedData.previous_jackpot && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        上期头奖：
                                      </span>
                                      <span className="font-medium ml-1">
                                        {(
                                          aiParsedData.previous_jackpot / 10000
                                        ).toFixed(0)}
                                        万元
                                      </span>
                                    </div>
                                  )}
                                  {aiParsedData.store_info && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        销售点：
                                      </span>
                                      <span className="font-medium ml-1">
                                        {aiParsedData.store_info.name} -{" "}
                                        {aiParsedData.store_info.address}
                                      </span>
                                    </div>
                                  )}
                                  {aiParsedData.print_time && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        打印时间：
                                      </span>
                                      <span className="font-medium ml-1">
                                        {aiParsedData.print_time}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 号码列表 */}
                        <div className="space-y-2">
                          {ocrResult.entries.map((entry, entryIdx) => {
                            const prizeResult = autoPrizeResults.find(
                              (r) => r.betIndex === entryIdx
                            );

                            return (
                              <div
                                key={entry.numbers.join("-")}
                                className={`p-3 rounded-lg border ${
                                  prizeResult && prizeResult.prize !== "未中奖"
                                    ? "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30"
                                    : "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-500/20"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    第 {entryIdx + 1} 注
                                  </span>
                                  {prizeResult && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        中{prizeResult.matchedMain}+
                                        {prizeResult.matchedSpecial}
                                      </span>
                                      <span
                                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                                          prizeResult.prize !== "未中奖"
                                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                            : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                                        }`}
                                      >
                                        {prizeResult.prize}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {entry.numbers.map((num, idx) => {
                                    const isMatched =
                                      prizeResult?.matchedMainNumbers.includes(
                                        num
                                      );
                                    return (
                                      <div
                                        key={idx}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm ${
                                          isMatched
                                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-500 text-white shadow-yellow-500/50"
                                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                        }`}
                                      >
                                        {num}
                                      </div>
                                    );
                                  })}
                                  {entry.specialNumbers.length > 0 && (
                                    <>
                                      <span className="text-sm font-bold text-muted-foreground mx-0.5">
                                        +
                                      </span>
                                      {entry.specialNumbers.map((num, idx) => {
                                        const isMatched =
                                          prizeResult?.matchedSpecialNumbers.includes(
                                            num
                                          );
                                        return (
                                          <div
                                            key={idx}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                                              isMatched
                                                ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-yellow-500 text-white shadow-yellow-500/50"
                                                : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                            }`}
                                          >
                                            {num}
                                          </div>
                                        );
                                      })}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Manual Input for Prize Calculation */}
              {selectedType !== "fc8" && (
                <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                  <CardHeader>
                    <CardTitle>奖金计算</CardTitle>
                    <CardDescription>
                      输入中奖号码数量，计算奖金等级
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>
                          {selectedType === "dlt" ? "前区" : "红球"}中奖个数
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max={config.mainCount}
                          value={matchedMain}
                          onChange={(e) =>
                            setMatchedMain(parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {selectedType === "dlt" ? "后区" : "蓝球"}中奖个数
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max={config.specialCount}
                          value={matchedSpecial}
                          onChange={(e) =>
                            setMatchedSpecial(parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={calculatePrize}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      计算奖金
                    </Button>

                    {calculatedPrize && (
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-center text-lg font-bold">
                          {calculatedPrize}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Number Generator Tab */}
          <TabsContent value="generator">
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <CardTitle>号码生成器</CardTitle>
                <CardDescription>随机生成彩票号码，祝您好运！</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lottery Type Selection */}
                <div className="space-y-3">
                  <Label>选择彩票类型</Label>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map(
                      (type) => (
                        <Button
                          key={type}
                          variant={
                            selectedType === type ? "default" : "outline"
                          }
                          onClick={() => setSelectedType(type)}
                          className={
                            selectedType === type
                              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                              : ""
                          }
                        >
                          {LOTTERY_CONFIGS[type].name}
                        </Button>
                      )
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateNumbers}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                  size="lg"
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  生成号码
                </Button>

                {/* Generated Numbers Display */}
                {generatedNumbers.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex flex-wrap gap-3 justify-center items-center">
                        {generatedNumbers.map((num, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg"
                          >
                            {num}
                          </div>
                        ))}
                        {generatedSpecialNumbers.length > 0 && (
                          <>
                            <span className="text-2xl font-bold mx-2">+</span>
                            {generatedSpecialNumbers.map((num, idx) => (
                              <div
                                key={idx}
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-red-600 text-white flex items-center justify-center font-bold text-lg shadow-lg"
                              >
                                {num}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={copyNumbers}
                      variant="outline"
                      className="w-full"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          复制号码
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lottery History Tab */}
          <TabsContent value="history">
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  大乐透开奖历史
                </CardTitle>
                <CardDescription>
                  最近50期开奖记录（数据来源：新浪彩票）
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-muted-foreground">
                      加载中...
                    </span>
                  </div>
                ) : historyData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暂无数据
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyData
                      .slice()
                      .reverse()
                      .map((item) => (
                        <div
                          key={item.issue}
                          className="p-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg border border-border hover:border-purple-500/30 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex-shrink-0">
                              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                第 {item.issue} 期
                              </span>
                            </div>
                            <div className="flex-1 flex flex-wrap items-center gap-2">
                              {item.numbers.map((num, idx) => (
                                <div
                                  key={idx}
                                  className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm shadow-sm"
                                >
                                  {num}
                                </div>
                              ))}
                              <span className="text-lg font-bold text-muted-foreground mx-1">
                                +
                              </span>
                              {item.specialNumbers.map((num, idx) => (
                                <div
                                  key={idx}
                                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
