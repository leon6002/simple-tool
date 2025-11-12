"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../../constants";
import { PrizeStatistics } from "../../utils";
import {
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

interface PrizeAnalysisMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statistics: PrizeStatistics | null;
  selectedType: string;
  mainNumbers: number[];
  specialNumbers: number[];
}

export function PrizeAnalysisMobile({
  open,
  onOpenChange,
  statistics,
  selectedType,
  mainNumbers,
  specialNumbers,
}: PrizeAnalysisMobileProps) {
  if (!statistics) return null;

  // 计算投注数量
  const calculateBetCount = () => {
    if (selectedType === "dlt") {
      const mainCount = mainNumbers.length;
      const specialCount = specialNumbers.length;

      if (mainCount === 5 && specialCount === 2) {
        return 1;
      } else {
        const mainCombos = mainCount >= 5 ? combination(mainCount, 5) : 0;
        const specialCombos =
          specialCount >= 2 ? combination(specialCount, 2) : 0;
        return mainCombos * specialCombos;
      }
    } else if (selectedType === "ssq") {
      const mainCount = mainNumbers.length;
      const specialCount = specialNumbers.length;

      if (mainCount === 6 && specialCount === 1) {
        return 1;
      } else {
        const mainCombos = mainCount >= 6 ? combination(mainCount, 6) : 0;
        return mainCombos * specialCount;
      }
    } else if (selectedType === "kl8") {
      const mainCount = mainNumbers.length;
      if (mainCount === 10) {
        return 1;
      } else {
        return mainCount >= 10 ? combination(mainCount, 10) : 0;
      }
    }
    return 1;
  };

  // 计算组合数
  const combination = (n: number, k: number): number => {
    if (n < k) return 0;
    if (k === 0 || n === k) return 1;

    let result = 1;
    for (let i = 0; i < k; i++) {
      result = (result * (n - i)) / (i + 1);
    }
    return Math.round(result);
  };

  // 计算总成本
  const calculateTotalCost = () => {
    return calculateBetCount() * statistics.totalDraws * 2;
  };

  // 计算盈亏百分比
  const profitPercentage = Math.abs(
    Math.round(
      ((statistics.totalPrizeAmount - calculateTotalCost()) /
        calculateTotalCost()) *
        100
    )
  );

  const isProfit = statistics.totalPrizeAmount > calculateTotalCost();

  // 统计各奖项数量
  const prizeBreakdown = statistics.records.reduce((acc, record) => {
    const prize = record.prize;
    acc[prize] = (acc[prize] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-0">
        {/* 渐变头部 */}
        <div className="sticky top-0 z-10 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-6 pt-8 pb-6 rounded-b-3xl shadow-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Award className="h-6 w-6" />
              </div>
              往期中奖分析
            </SheetTitle>
            <SheetDescription className="text-indigo-100 text-sm mt-2">
              基于历史数据的智能分析报告
            </SheetDescription>
          </SheetHeader>

          {/* 当前选号展示 - 融入头部 */}
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm font-medium text-white/90">当前选号</div>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                {selectedType === "dlt"
                  ? "大乐透"
                  : selectedType === "ssq"
                  ? "双色球"
                  : "快乐8"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {mainNumbers.map((num, idx) => (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-full bg-white text-red-600 text-sm flex items-center justify-center font-bold shadow-lg"
                >
                  {String(num).padStart(2, "0")}
                </div>
              ))}
              {specialNumbers.length > 0 && (
                <>
                  <span className="text-lg font-bold text-white/60 mx-1">
                    +
                  </span>
                  {specialNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-9 h-9 rounded-full bg-white text-blue-600 text-sm flex items-center justify-center font-bold shadow-lg"
                    >
                      {String(num).padStart(2, "0")}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-4 bg-gray-50 dark:bg-gray-950">
          {/* 投资回报总览 - Hero Card */}
          <div
            className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl ${
              isProfit
                ? "bg-linear-to-br from-emerald-500 via-green-500 to-teal-500"
                : "bg-linear-to-br from-rose-500 via-red-500 to-pink-500"
            }`}
          >
            {/* 装饰性背景图案 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                {isProfit ? (
                  <TrendingUp className="h-5 w-5 text-white" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white" />
                )}
                <span className="text-sm font-medium text-white/90">
                  投资回报
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-4xl font-black text-white mb-2">
                    {formatCurrency(
                      statistics.totalPrizeAmount - calculateTotalCost()
                    )}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-xs font-bold text-white">
                      {isProfit ? "📈 盈利" : "📉 亏损"}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {profitPercentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-white/70 mb-1">总收入</div>
                    <div className="text-sm font-bold text-white">
                      {formatCurrency(statistics.totalPrizeAmount)}
                    </div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-white/70 mb-1">总成本</div>
                    <div className="text-sm font-bold text-white">
                      {formatCurrency(calculateTotalCost())}
                    </div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-white/70 mb-1">投注量</div>
                    <div className="text-sm font-bold text-white">
                      {calculateBetCount()}×{statistics.totalDraws}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 统计数据卡片 - 现代化设计 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 中奖次数 */}
            <div className="relative overflow-hidden bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    中奖次数
                  </span>
                </div>
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">
                  {statistics.winningDraws}
                </div>
                <div className="text-xs text-blue-600/60 dark:text-blue-400/60">
                  共 {statistics.totalDraws} 期
                </div>
              </div>
            </div>

            {/* 中奖率 */}
            <div className="relative overflow-hidden bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    中奖率
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                  {statistics.winningRate.toFixed(0)}%
                </div>
                <div className="text-xs text-emerald-600/60 dark:text-emerald-400/60">
                  {statistics.winningDraws}/{statistics.totalDraws}
                </div>
              </div>
            </div>
          </div>

          {/* 最高奖项 - 突出显示 */}
          {statistics.maxPrizeAmount > 0 && (
            <div className="relative overflow-hidden bg-linear-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl p-5 shadow-xl">
              {/* 装饰元素 */}
              <div className="absolute top-0 right-0 text-6xl opacity-10">
                🏆
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-white/30 rounded-xl backdrop-blur-sm">
                    <Award className="h-5 w-5 text-amber-900" />
                  </div>
                  <span className="text-sm font-bold text-amber-900">
                    最高奖项
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-black text-amber-900 mb-1">
                      {formatCurrency(statistics.maxPrizeAmount)}
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <Calendar className="h-3 w-3 text-amber-900" />
                      <span className="text-xs font-medium text-amber-900">
                        {statistics.maxPrizeIssue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 奖项分布 - 可视化设计 */}
          {Object.keys(prizeBreakdown).length > 0 && (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  奖项分布
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  各奖项中奖次数统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {Object.entries(prizeBreakdown)
                    .sort((a, b) => {
                      const order = [
                        "一等奖",
                        "二等奖",
                        "三等奖",
                        "四等奖",
                        "五等奖",
                        "六等奖",
                        "七等奖",
                        "八等奖",
                        "九等奖",
                      ];
                      return order.indexOf(a[0]) - order.indexOf(b[0]);
                    })
                    .map(([prize, count]) => {
                      const prizeColors: Record<string, string> = {
                        一等奖: "from-red-500 to-orange-500",
                        二等奖: "from-orange-500 to-amber-500",
                        三等奖: "from-amber-500 to-yellow-500",
                        四等奖: "from-blue-500 to-cyan-500",
                        五等奖: "from-cyan-500 to-teal-500",
                        六等奖: "from-teal-500 to-emerald-500",
                        七等奖: "from-purple-500 to-pink-500",
                        八等奖: "from-pink-500 to-rose-500",
                        九等奖: "from-gray-500 to-slate-500",
                      };
                      const colorClass =
                        prizeColors[prize] || "from-gray-500 to-slate-500";

                      return (
                        <div
                          key={prize}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-linear-to-br ${colorClass} flex items-center justify-center text-white font-bold text-xs shadow-md`}
                            >
                              {prize.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {prize}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {count}
                            </span>
                            <span className="text-xs text-gray-500">次</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 中奖记录 - 时间线设计 */}
          {statistics.records.length > 0 && (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  中奖记录
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  最近 {Math.min(statistics.records.length, 10)} 条中奖记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {statistics.records.slice(0, 10).map((record, idx) => (
                    <div
                      key={idx}
                      className="relative pl-6 pb-3 border-l-2 border-indigo-200 dark:border-indigo-800 last:border-l-0 last:pb-0"
                    >
                      {/* 时间线圆点 */}
                      <div className="absolute left-0 top-1 -ml-[9px] w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900 shadow-md" />

                      <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-3.5 space-y-2 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              第 {record.issue} 期
                            </div>
                            <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-yellow-400 to-orange-400 px-2.5 py-1 rounded-lg">
                              <Award className="h-3 w-3 text-amber-900" />
                              <span className="text-xs font-bold text-amber-900">
                                {record.prize}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(record.prizeAmount)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-500 dark:text-gray-400">
                              匹配
                            </span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {record.matches.main}
                            </span>
                            <span className="text-gray-400">+</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {record.matches.special}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 无中奖提示 - 友好设计 */}
          {statistics.winningDraws === 0 && (
            <div className="relative overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="absolute top-0 right-0 text-8xl opacity-5">
                😔
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  暂无中奖记录
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  该选号在最近 {statistics.totalDraws} 期中未中奖
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 px-4">
                  💡 建议尝试其他号码组合或使用不同的生成算法
                </p>
              </div>
            </div>
          )}

          {/* 底部间距 */}
          <div className="h-4" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
