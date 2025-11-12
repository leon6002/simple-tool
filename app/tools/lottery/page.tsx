/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

// 导入类型和工具
import {
  LotteryType,
  DLTAIParsedData,
  SSQAIParsedData,
  KL8AIParsedData,
  AutoPrizeResult,
} from "./types";
import { LOTTERY_CONFIGS } from "./constants";
import { analyzeStatistics } from "./utils";

// 导入组件
import {
  OCRProcessor,
  StatisticsPanel,
  NumberGenerator,
  HistoryDisplay,
} from "./components";
import { KL8PrizeCalculator } from "./components/KL8PrizeCalculator";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLotteryStore } from "@/lib/stores/lottery/lottery-store";

export default function LotteryPage() {
  // Prize calculator states
  const [matchedMain, setMatchedMain] = useState(0);
  const [matchedSpecial, setMatchedSpecial] = useState(0);
  const [calculatedPrize, setCalculatedPrize] = useState<string | null>(null);

  // 基础状态
  const isMobile = useIsMobile();
  const [selectedType, setSelectedType] = useState<LotteryType>("dlt");
  const setStatistics = useLotteryStore((state) => state.setStatistics);

  // OCR相关状态
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [aiParsedData, setAiParsedData] = useState<
    DLTAIParsedData | SSQAIParsedData | KL8AIParsedData | null
  >(null);
  const [autoPrizeResults, setAutoPrizeResults] = useState<AutoPrizeResult[]>(
    []
  );

  const [historyLoading, setHistoryLoading] = useState(false);

  const dltHistoryData = useLotteryStore((state) => state.lotteryHistoryData);
  const setDltHistoryData = useLotteryStore(
    (state) => state.setLotteryHistoryData
  );
  const ssqHistoryData = useLotteryStore((state) => state.ssqHistoryData);
  const setSsqHistoryData = useLotteryStore((state) => state.setSsqHistoryData);
  const kl8HistoryData = useLotteryStore((state) => state.kl8HistoryData);
  const setKL8HistoryData = useLotteryStore((state) => state.setKL8HistoryData);

  const config = LOTTERY_CONFIGS[selectedType];

  // 处理OCR结果
  const handleOCRResult = useCallback(
    (
      ocrResult: any,
      aiData: DLTAIParsedData | SSQAIParsedData | KL8AIParsedData | null,
      prizeResults: AutoPrizeResult[]
    ) => {
      setOcrResult(ocrResult);
      setAiParsedData(aiData);
      setAutoPrizeResults(prizeResults);
    },
    []
  );

  // 获取历史数据
  const fetchLotteryHistory = async () => {
    setHistoryLoading(true);
    try {
      const [dltResponse, ssqResponse, kl8Response] = await Promise.all([
        fetch("/api/lottery/history"),
        fetch("/api/lottery/ssq-history"),
        fetch("/api/lottery/kl8-history"),
      ]);

      if (dltResponse.ok) {
        const dltData = await dltResponse.json();
        setDltHistoryData(dltData.data || []);
      } else {
        console.error("Failed to fetch DLT history:", dltResponse.status);
        setDltHistoryData([]);
      }

      if (ssqResponse.ok) {
        const ssqData = await ssqResponse.json();
        setSsqHistoryData(ssqData || []);
      } else {
        console.error("Failed to fetch SSQ history:", ssqResponse.status);
        setSsqHistoryData([]);
      }

      if (kl8Response.ok) {
        const kl8Data = await kl8Response.json();
        // kl8Data 直接是数组，不需要 .data
        setKL8HistoryData(Array.isArray(kl8Data) ? kl8Data : []);
      } else {
        console.error("Failed to fetch KL8 history:", kl8Response.status);
        setKL8HistoryData([]);
      }
    } catch (error) {
      console.error("Failed to fetch lottery history:", error);
      // 确保即使API失败也有空数组作为后备
      setDltHistoryData([]);
      setSsqHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 奖金计算
  const calculatePrize = useCallback(() => {
    let prize = "";

    if (selectedType === "dlt") {
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
      else if (matchedMain === 3 && matchedSpecial === 2)
        prize = "六等奖（200元）";
      else if (matchedMain === 2 && matchedSpecial === 2)
        prize = "七等奖（100元）";
      else if (matchedMain === 1 && matchedSpecial === 2)
        prize = "八等奖（15元）";
      else if (matchedMain === 0 && matchedSpecial === 2)
        prize = "八等奖（15元）";
      else prize = "未中奖";
    } else if (selectedType === "ssq") {
      if (matchedMain === 6 && matchedSpecial === 1)
        prize = "一等奖（浮动奖金）";
      else if (matchedMain === 6 && matchedSpecial === 0)
        prize = "二等奖（浮动奖金）";
      else if (matchedMain === 5 && matchedSpecial === 1)
        prize = "三等奖（3,000元）";
      else if (matchedMain === 5 && matchedSpecial === 0)
        prize = "四等奖（200元）";
      else if (matchedMain === 4 && matchedSpecial === 1)
        prize = "四等奖（200元）";
      else if (matchedMain === 4 && matchedSpecial === 0)
        prize = "五等奖（10元）";
      else if (matchedMain === 3 && matchedSpecial === 1)
        prize = "五等奖（10元）";
      else if (matchedMain === 2 && matchedSpecial === 1)
        prize = "六等奖（5元）";
      else if (matchedMain === 1 && matchedSpecial === 1)
        prize = "六等奖（5元）";
      else if (matchedMain === 0 && matchedSpecial === 1)
        prize = "六等奖（5元）";
      else prize = "未中奖";
    } else {
      prize = "福彩8请参考官方规则";
    }

    setCalculatedPrize(prize);
  }, [selectedType, matchedMain, matchedSpecial]);

  // 页面初始化
  useEffect(() => {
    fetchLotteryHistory();
  }, []);

  // 自动分析统计数据
  useEffect(() => {
    if (dltHistoryData.length > 0 || ssqHistoryData.length > 0) {
      try {
        const historyData =
          selectedType === "ssq" ? ssqHistoryData : dltHistoryData;
        if (historyData.length > 0) {
          const stats = analyzeStatistics(historyData, selectedType, config);
          setStatistics(stats);
        }
      } catch (error) {
        console.error("统计分析失败:", error);
      }
    }
  }, [dltHistoryData, ssqHistoryData, selectedType, config, setStatistics]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            彩票工具
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            提供大乐透、双色球和福彩8的OCR识别、智能选号和奖金计算功能
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="calculator">奖金计算</TabsTrigger>
            <TabsTrigger value="generator">号码生成器</TabsTrigger>
            <TabsTrigger value="history">开奖历史</TabsTrigger>
          </TabsList>

          {/* 奖金计算标签页 */}
          <TabsContent value="calculator">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OCR处理器 */}
                <OCRProcessor
                  onOCRResult={handleOCRResult}
                  lotteryHistoryData={dltHistoryData}
                  ssqHistoryData={ssqHistoryData}
                  kl8HistoryData={kl8HistoryData}
                />

                {/* 识别结果 - 右侧显示 */}
                {ocrResult ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      识别结果：
                    </p>

                    {/* 彩票信息卡片 */}
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            期数
                          </p>
                          <p className="font-semibold text-xs">
                            {ocrResult.issueNumber || "未识别"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            开奖日期
                          </p>
                          <p className="font-semibold text-xs">
                            {ocrResult.drawDate || "未识别"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            成本
                          </p>
                          <p className="font-semibold text-xs">
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
                        const lotteryType = ocrResult.type || "dlt";

                        if (lotteryType === "kl8") {
                          console.log(
                            "快乐8查找开奖号码 - 期号:",
                            ocrResult.issueNumber
                          );
                          console.log(
                            "快乐8历史数据:",
                            kl8HistoryData.map((d) => d.issue)
                          );

                          const kl8Draw = kl8HistoryData.find(
                            (draw) =>
                              draw.issue === ocrResult.issueNumber ||
                              draw.issue.endsWith(ocrResult.issueNumber!)
                          );

                          console.log("找到的快乐8开奖数据:", kl8Draw);

                          if (kl8Draw) {
                            return (
                              <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 text-center">
                                  第 {kl8Draw.issue} 期开奖号码（快乐8）
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-1">
                                  {kl8Draw.numbers.map(
                                    (num: number, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                      >
                                        {num}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          }
                        } else if (lotteryType === "ssq") {
                          const ssqDraw = ssqHistoryData.find(
                            (draw) =>
                              draw.issue === ocrResult.issueNumber ||
                              draw.issue.endsWith(ocrResult.issueNumber!)
                          );

                          if (ssqDraw) {
                            return (
                              <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 text-center">
                                  第 {ssqDraw.issue} 期开奖号码（双色球）
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-1">
                                  {ssqDraw.redBalls.map(
                                    (num: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                      >
                                        {num}
                                      </div>
                                    )
                                  )}
                                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400 mx-1">
                                    +
                                  </span>
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                    {ssqDraw.blueBall}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        } else {
                          let dltDraw = dltHistoryData.find(
                            (draw) => draw.issue === ocrResult.issueNumber
                          );

                          if (
                            !dltDraw &&
                            ocrResult.issueNumber &&
                            ocrResult.issueNumber.length === 5
                          ) {
                            dltDraw = dltHistoryData.find((draw) =>
                              draw.issue.endsWith(ocrResult.issueNumber!)
                            );
                          }

                          if (!dltDraw && ocrResult.issueNumber) {
                            const shortIssue = ocrResult.issueNumber.slice(-5);
                            dltDraw = dltHistoryData.find((draw) =>
                              draw.issue.endsWith(shortIssue)
                            );
                          }

                          if (dltDraw) {
                            return (
                              <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 text-center">
                                  第 {dltDraw.issue} 期开奖号码（大乐透）
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-1">
                                  {dltDraw.numbers.map(
                                    (num: number, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                      >
                                        {num}
                                      </div>
                                    )
                                  )}
                                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400 mx-1">
                                    +
                                  </span>
                                  {dltDraw.specialNumbers.map(
                                    (num: number, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                      >
                                        {num}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}

                    {/* 号码列表 - 紧凑版 */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {ocrResult.entries.map((entry: any, entryIdx: number) => {
                        const prizeResult = autoPrizeResults.find(
                          (r) => r.betIndex === entryIdx
                        );

                        return (
                          <div
                            key={
                              entry.numbers.join("-") +
                              "-" +
                              entry.specialNumbers.join("-")
                            }
                            className={`p-2 rounded-lg border ${
                              prizeResult && prizeResult.prize !== "未中奖"
                                ? "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30"
                                : "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-500/20"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold text-muted-foreground">
                                第 {entryIdx + 1} 注
                              </span>
                              {prizeResult && (
                                <span
                                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                    prizeResult.prize !== "未中奖"
                                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                      : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {prizeResult.prize}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              {entry.numbers.map((num: number, idx: number) => {
                                const isMatched =
                                  prizeResult?.matchedMainNumbers.includes(num);
                                const lotteryType = ocrResult.type || "dlt";
                                return (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                                      isMatched
                                        ? lotteryType === "kl8"
                                          ? "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-500 text-white"
                                          : "bg-gradient-to-br from-red-500 to-red-600 border-red-500 text-white"
                                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {num}
                                  </div>
                                );
                              })}
                              {entry.specialNumbers.length > 0 && (
                                <>
                                  <span className="text-xs font-bold text-muted-foreground mx-0.5">
                                    +
                                  </span>
                                  {entry.specialNumbers.map(
                                    (num: number, idx: number) => {
                                      const isMatched =
                                        prizeResult?.matchedSpecialNumbers.includes(
                                          num
                                        );
                                      return (
                                        <div
                                          key={idx}
                                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                            isMatched
                                              ? "bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-500 text-white"
                                              : "border-2 border-blue-500 text-white"
                                          }`}
                                        >
                                          {num}
                                        </div>
                                      );
                                    }
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI解析的详细信息 - 移到这里 */}
                    {aiParsedData && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          详细信息
                        </p>
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="grid grid-cols-2 gap-2 text-xs">
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
                            {"multiple" in aiParsedData && (
                              <div>
                                <span className="text-muted-foreground">
                                  倍数：
                                </span>
                                <span className="font-medium ml-1">
                                  {(aiParsedData as DLTAIParsedData).multiple}倍
                                </span>
                              </div>
                            )}
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

                        {"store_info" in aiParsedData &&
                          (aiParsedData as any).store_info?.address && (
                            <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="text-xs space-y-1">
                                <div>
                                  <span className="text-muted-foreground">
                                    销售点：
                                  </span>
                                  <span className="font-medium ml-1">
                                    {(aiParsedData as any).store_info.address}
                                  </span>
                                </div>
                                {(aiParsedData as any).print_time && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      打印时间：
                                    </span>
                                    <span className="font-medium ml-1">
                                      {(aiParsedData as any).print_time}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 手动奖金计算 - 没有OCR结果时显示 */
                  <Card>
                    <CardHeader>
                      <CardTitle>手动奖金计算</CardTitle>
                      <CardDescription>
                        选择彩票类型并输入中奖号码数量
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 彩票类型选择 */}
                      <div className="space-y-3">
                        <Label>选择彩票类型</Label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map(
                            (type) => (
                              <Button
                                key={type}
                                variant={
                                  selectedType === type ? "default" : "outline"
                                }
                                onClick={() => setSelectedType(type)}
                                size="sm"
                                className={
                                  selectedType === type
                                    ? "bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                                    : ""
                                }
                              >
                                {LOTTERY_CONFIGS[type].name}
                              </Button>
                            )
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {config.description}
                        </p>
                      </div>

                      {selectedType !== "kl8" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">
                                {selectedType === "dlt" ? "前区" : "红球"}
                                中奖个数
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max={
                                  Array.isArray(config.mainCount)
                                    ? config.mainCount[1]
                                    : config.mainCount
                                }
                                value={matchedMain}
                                onChange={(e) =>
                                  setMatchedMain(parseInt(e.target.value) || 0)
                                }
                                className="text-center"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">
                                {selectedType === "dlt" ? "后区" : "蓝球"}
                                中奖个数
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max={
                                  Array.isArray(config.specialCount)
                                    ? config.specialCount[1]
                                    : config.specialCount
                                }
                                value={matchedSpecial}
                                onChange={(e) =>
                                  setMatchedSpecial(
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="text-center"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={calculatePrize}
                            className="w-full bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                          >
                            <Calculator className="h-4 w-4 mr-2" />
                            计算奖金
                          </Button>

                          {calculatedPrize && (
                            <div className="p-4 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                              <p className="text-center text-lg font-bold">
                                {calculatedPrize}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* 福彩8专用奖金计算器 */}
                      {selectedType === "kl8" && <KL8PrizeCalculator />}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 号码生成器标签页 */}
          <TabsContent value="generator">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 左侧：操作区 */}
              <div className="w-full lg:w-[30%] space-y-6">
                {/* 统计分析面板 */}
                {!isMobile && (
                  <StatisticsPanel
                    lotteryHistoryData={dltHistoryData}
                    ssqHistoryData={ssqHistoryData}
                    kl8HistoryData={kl8HistoryData}
                  />
                )}
              </div>

              {/* 右侧：展示区 */}
              <div className="w-full lg:w-[70%] space-y-6">
                {/* 号码生成器 */}
                <NumberGenerator
                  lotteryHistoryData={dltHistoryData}
                  ssqHistoryData={ssqHistoryData}
                  kl8HistoryData={kl8HistoryData}
                />
              </div>
            </div>
          </TabsContent>

          {/* 开奖历史标签页 */}
          <TabsContent value="history">
            <HistoryDisplay
              dltHistoryData={dltHistoryData}
              ssqHistoryData={ssqHistoryData}
              historyLoading={historyLoading}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
