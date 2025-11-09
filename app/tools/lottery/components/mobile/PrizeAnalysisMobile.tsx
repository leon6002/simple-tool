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
  DollarSign,
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("zh-CN").format(num);
  };

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
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            往期中奖分析
          </SheetTitle>
          <SheetDescription>分析您的选号在历史开奖中的表现</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* 当前选号展示 */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-blue-600">🎯</span>
                当前选号
                <Badge variant="outline" className="text-xs">
                  {selectedType === "dlt"
                    ? "大乐透"
                    : selectedType === "ssq"
                    ? "双色球"
                    : "快乐8"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {mainNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full bg-linear-to-br from-red-500 to-orange-500 text-white text-xs flex items-center justify-center font-bold shadow-md"
                  >
                    {num}
                  </div>
                ))}
                {specialNumbers.length > 0 && (
                  <>
                    <span className="text-base font-bold text-gray-400 mx-1">
                      +
                    </span>
                    {specialNumbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold shadow-md"
                      >
                        {num}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 投资回报总览 */}
          <Card className="bg-linear-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                投资回报分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    statistics.totalPrizeAmount - calculateTotalCost()
                  )}
                </div>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isProfit
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {isProfit ? "盈利" : "亏损"} {profitPercentage}%
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                  <div className="text-gray-500 dark:text-gray-400">收入</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(statistics.totalPrizeAmount)}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                  <div className="text-gray-500 dark:text-gray-400">成本</div>
                  <div className="font-semibold text-red-600">
                    {formatCurrency(calculateTotalCost())}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                  <div className="text-gray-500 dark:text-gray-400">投注</div>
                  <div className="font-semibold text-blue-600">
                    {calculateBetCount()}注×{statistics.totalDraws}期
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计数据卡片 */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-600" />
                  中奖次数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.winningDraws}
                </div>
                <div className="text-xs text-gray-500">
                  共 {statistics.totalDraws} 期
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  中奖率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.winningRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">
                  {statistics.winningDraws}/{statistics.totalDraws}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最高奖项 */}
          {statistics.maxPrizeAmount > 0 && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Award className="h-3 w-3 text-yellow-600" />
                  最高奖项
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-yellow-600">
                      {formatCurrency(statistics.maxPrizeAmount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      期号: {statistics.maxPrizeIssue}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 奖项分布 */}
          {Object.keys(prizeBreakdown).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">奖项分布</CardTitle>
                <CardDescription className="text-xs">
                  各奖项中奖次数统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
                    .map(([prize, count]) => (
                      <div
                        key={prize}
                        className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium"
                          >
                            {prize}
                          </Badge>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {count} 次
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 中奖记录 */}
          {statistics.records.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  中奖记录
                </CardTitle>
                <CardDescription className="text-xs">
                  最近 {Math.min(statistics.records.length, 10)} 条中奖记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {statistics.records.slice(0, 10).map((record, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          期号: {record.issue}
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        >
                          {record.prize}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-gray-600 dark:text-gray-400">
                          匹配: {record.matches.main}+{record.matches.special}
                        </div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(record.prizeAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 无中奖提示 */}
          {statistics.winningDraws === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  该选号在最近 {statistics.totalDraws} 期中未中奖
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  建议尝试其他号码组合或算法
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
