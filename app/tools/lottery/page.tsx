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
import { useIsMobile } from "@/hooks/useIsMobile";
import { StatisticsPanelMobile } from "./components/mobile/StatisticsPanelMobile";
import { useLotteryStore } from "@/lib/stores/lottery/lottery-store";

export default function LotteryPage() {
  // Prize calculator states
  const [matchedMain, setMatchedMain] = useState(0);
  const [matchedSpecial, setMatchedSpecial] = useState(0);
  const [calculatedPrize, setCalculatedPrize] = useState<string | null>(null);

  // 基础状态
  const isMobile = useIsMobile();
  const [selectedType, setSelectedType] = useState<LotteryType>("dlt");
  const statistics = useLotteryStore((state) => state.statistics);
  const setStatistics = useLotteryStore((state) => state.setStatistics);

  // OCR相关状态
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [aiParsedData, setAiParsedData] = useState<
    DLTAIParsedData | SSQAIParsedData | null
  >(null);
  const [autoPrizeResults, setAutoPrizeResults] = useState<AutoPrizeResult[]>(
    []
  );

  // 历史数据状态
  const [dltHistoryData, setDltHistoryData] = useState<any[]>([]);
  const [ssqHistoryData, setSsqHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const config = LOTTERY_CONFIGS[selectedType];

  // 处理OCR结果
  const handleOCRResult = useCallback(
    (
      ocrResult: any,
      aiData: DLTAIParsedData | SSQAIParsedData | null,
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
      const [dltResponse, ssqResponse] = await Promise.all([
        fetch("/api/lottery/history"),
        fetch("/api/lottery/ssq-history"),
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
            提供大乐透和双色球的OCR识别、智能选号和奖金计算功能
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
                />

                {/* 手动奖金计算 */}
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

                    {selectedType !== "fc8" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">
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
                              className="text-center"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 号码生成器标签页 */}
          <TabsContent value="generator">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 左侧：操作区 */}
              <div className="w-full lg:w-[30%] space-y-6">
                {/* 统计分析面板 */}
                {isMobile && (
                  <StatisticsPanelMobile
                    selectedType={selectedType}
                    lotteryHistoryData={dltHistoryData}
                    ssqHistoryData={ssqHistoryData}
                  />
                )}
                {!isMobile && (
                  <StatisticsPanel
                    lotteryHistoryData={dltHistoryData}
                    ssqHistoryData={ssqHistoryData}
                  />
                )}
              </div>

              {/* 右侧：展示区 */}
              <div className="w-full lg:w-[70%] space-y-6">
                {/* 号码生成器 */}
                <NumberGenerator
                  lotteryHistoryData={dltHistoryData}
                  ssqHistoryData={ssqHistoryData}
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
