/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LOTTERY_CONFIGS } from "../../constants";
import {
  getHighFrequencyNumbers,
  getColdNumbers,
  analyzeStatistics,
} from "../../utils";
import { BarChart3, History } from "lucide-react";
import { useState, useEffect } from "react";
import { NumberSlotStatisticsMobile } from "./NumberSlotStatisticsMobile";
import { useLotteryStore } from "@/lib/stores/lottery/lottery-store";

export const StatisticsPanelMobile = () => {
  const selectedType = useLotteryStore((state) => state.selectedType);
  const lotteryHistoryData = useLotteryStore(
    (state) => state.lotteryHistoryData
  );
  const ssqHistoryData = useLotteryStore((state) => state.ssqHistoryData);
  const config = LOTTERY_CONFIGS[selectedType];

  const statistics = useLotteryStore((state) => state.statistics);
  const setStatistics = useLotteryStore((state) => state.setStatistics);

  // 统计范围状态
  const [statisticsRange, setStatisticsRange] = useState<number>(50);

  // 根据统计范围重新计算统计数据
  useEffect(() => {
    const historyData =
      selectedType === "dlt" ? lotteryHistoryData : ssqHistoryData;
    if (historyData && historyData.length > 0) {
      const limitedData = historyData.slice(-statisticsRange);
      const newStats = analyzeStatistics(limitedData, selectedType, config);
      // 添加原始数据到统计结果中
      newStats.rangeData = limitedData;
      setStatistics(newStats);
    }
  }, [
    selectedType,
    lotteryHistoryData,
    ssqHistoryData,
    statisticsRange,
    config,
    setStatistics,
  ]);

  // 使用范围统计或原始统计

  if (!statistics)
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            统计分析
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground border border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <h4 className="text-sm font-medium mb-1">暂无统计数据</h4>
            <p className="text-xs">请先进行统计分析</p>
          </div>
        </CardContent>
      </Card>
    );
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="w-full bg-linear-to-r from-blue-600 via-purple-600 to-amber-600 text-white hover:opacity-90 transition-all shadow-lg"
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            统计分析数据查看
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[75vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              智能选号设置
            </SheetTitle>
            <SheetDescription>
              选择彩票类型和算法，一键生成幸运号码
            </SheetDescription>
          </SheetHeader>
          {/* 主体内容区域 */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-1">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                统计分析
              </CardTitle>
              <CardDescription className="text-xs">
                基于{selectedType === "dlt" ? "大乐透" : "双色球"}最近
                {statisticsRange}期数据
              </CardDescription>
              {/* 统计范围选择 */}
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs font-medium">统计范围</Label>
                <Select
                  value={statisticsRange.toString()}
                  onValueChange={(value) => setStatisticsRange(parseInt(value))}
                >
                  <SelectTrigger className="w-28 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">最近5期</SelectItem>
                    <SelectItem value="10">最近10期</SelectItem>
                    <SelectItem value="20">最近20期</SelectItem>
                    <SelectItem value="30">最近30期</SelectItem>
                    <SelectItem value="50">最近50期</SelectItem>
                    <SelectItem value="100">最近100期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {/* 历史开奖号码 */}
              <div className="p-3 bg-linear-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-3 w-3 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    最近开奖号码 ({selectedType === "dlt" ? "大乐透" : "双色球"}
                    )
                  </h4>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedType === "dlt"
                    ? lotteryHistoryData
                    : ssqHistoryData
                  )
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-indigo-100/30 dark:border-indigo-800/30"
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-1 h-auto bg-amber-500"
                        >
                          {(record.issue || record.period || "").slice(-3)}期
                        </Badge>
                        <div className="flex items-center gap-1 flex-1">
                          {record.numbers ||
                          record.redBalls ||
                          record.mainNumbers ? (
                            <>
                              {(
                                record.numbers ||
                                record.redBalls ||
                                record.mainNumbers
                              )
                                .slice(0, 5)
                                .map((num: number, idx: number) => (
                                  <div
                                    key={idx}
                                    className="w-6 h-6 rounded-full bg-linear-to-br from-red-500 to-orange-500 text-white text-xs flex items-center justify-center font-bold shadow-sm"
                                  >
                                    {num}
                                  </div>
                                ))}
                              {(record.specialNumbers || record.blueBalls) && (
                                <>
                                  <span className="text-sm font-bold text-gray-400 mx-1">
                                    +
                                  </span>
                                  {(record.specialNumbers || record.blueBalls)
                                    .slice(0, 2)
                                    .map((num: number, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold shadow-sm"
                                      >
                                        {num}
                                      </div>
                                    ))}
                                </>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">
                              数据加载中...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 详细数据展示 */}
              <div className="space-y-3">
                {/* 主号码详细频次分析 */}
                <div className="p-3 bg-linear-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                    {selectedType === "dlt" ? "前区" : "红球"}频次
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {/* 频次排名 */}
                    <div>
                      <h5 className="text-xs font-medium mb-1 text-amber-400">
                        频次排名
                      </h5>
                      <div className="space-y-1">
                        {getHighFrequencyNumbers(
                          statistics,
                          10,
                          false,
                          config
                        ).map((num) => {
                          const frequency = statistics.frequency[num] || 0;
                          const allFrequencies = Object.values(
                            statistics.frequency
                          ).filter((f: any) => f > 0) as number[];
                          const maxFreq = Math.max(...allFrequencies);
                          const percentage =
                            maxFreq > 0 ? (frequency / maxFreq) * 100 : 0;

                          return (
                            <div key={num} className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold shrink-0 cursor-pointer hover:bg-amber-600 transition-colors">
                                {`${num < 10 ? "0" : ""}${num}`}
                              </div>
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer">
                                <div
                                  className="h-full bg-linear-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300 hover:from-amber-600 hover:to-amber-700"
                                  style={{
                                    width: `${Math.max(percentage, 5)}%`,
                                  }}
                                ></div>
                                {`出现${frequency}次`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 遗漏排名 */}
                    <div>
                      <h5 className="text-xs font-medium mb-1 text-blue-600">
                        遗漏排名
                      </h5>
                      <div className="space-y-1">
                        {getColdNumbers(statistics, 10, false, config).map(
                          (num) => {
                            const omission = statistics.omission[num] || 0;
                            const allOmissions = Object.values(
                              statistics.omission
                            ).filter((o: any) => o > 0) as number[];
                            const maxOmission = Math.max(...allOmissions);
                            const percentage =
                              maxOmission > 0
                                ? (omission / maxOmission) * 100
                                : 0;

                            return (
                              <div
                                key={num}
                                className="flex items-center gap-1"
                              >
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold shrink-0 cursor-pointer hover:bg-blue-600 transition-colors">
                                  {`${num < 10 ? "0" : ""}${num}`}
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer">
                                  <div
                                    className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                                    style={{
                                      width: `${Math.max(percentage, 5)}%`,
                                    }}
                                  ></div>
                                  {`遗漏${omission}期`}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 特殊号码详细分析 */}
                {config.specialCount && (
                  <div className="p-3 bg-linear-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200/50 dark:border-green-800/30">
                    <h4 className="text-xs font-bold text-red-700 dark:text-red-400 mb-2">
                      {selectedType === "dlt" ? "后区" : "蓝球"}频次
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* 高频特殊号码详情 */}
                      <div>
                        <h5 className="text-xs font-medium mb-1 text-red-400">
                          高频详情
                        </h5>
                        <div className="space-y-1">
                          {getHighFrequencyNumbers(
                            statistics,
                            6,
                            true,
                            config
                          ).map((num) => {
                            const frequency = statistics.frequency[num] || 0;
                            const specialFrequencies = Object.values(
                              statistics.frequency
                            ).filter((f: any) => f > 0) as number[];
                            const maxFreq = Math.max(...specialFrequencies);
                            const percentage =
                              maxFreq > 0 ? (frequency / maxFreq) * 100 : 0;

                            return (
                              <div
                                key={num}
                                className="flex items-center gap-1"
                              >
                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold shrink-0 cursor-pointer hover:bg-amber-600 transition-colors">
                                  {`${num < 10 ? "0" : ""}${num}`}
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer">
                                  <div
                                    className="h-full bg-linear-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300 hover:from-amber-600 hover:to-amber-700"
                                    style={{
                                      width: `${Math.max(percentage, 10)}%`,
                                    }}
                                  ></div>
                                  {`出现${frequency}次`}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 冷门特殊号码详情 */}
                      <div>
                        <h5 className="text-xs font-medium mb-1 text-blue-600">
                          冷门详情
                        </h5>
                        <div className="space-y-1">
                          {getColdNumbers(statistics, 6, true, config).map(
                            (num) => {
                              const omission = statistics.omission[num] || 0;
                              const specialOmissions = Object.values(
                                statistics.omission
                              ).filter((o: any) => o > 0) as number[];
                              const maxOmission = Math.max(...specialOmissions);
                              const percentage =
                                maxOmission > 0
                                  ? (omission / maxOmission) * 100
                                  : 0;

                              return (
                                <div
                                  key={num}
                                  className="flex items-center gap-1"
                                >
                                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold shrink-0 cursor-pointer hover:bg-blue-600 transition-colors">
                                    {`${num < 10 ? "0" : ""}${num}`}
                                  </div>
                                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer">
                                    <div
                                      className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                                      style={{
                                        width: `${Math.max(percentage, 10)}%`,
                                      }}
                                    ></div>
                                    {`遗漏${omission}期`}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {statistics && (
            <NumberSlotStatisticsMobile
              selectedType={selectedType}
              config={config}
              lotteryHistoryData={lotteryHistoryData}
              ssqHistoryData={ssqHistoryData}
              statistics={statistics}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
