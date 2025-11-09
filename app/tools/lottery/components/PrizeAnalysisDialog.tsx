"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../constants";
import { PrizeStatistics } from "../utils";
import {
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  Calendar,
} from "lucide-react";

interface PrizeAnalysisPanelProps {
  statistics: PrizeStatistics | null;
  selectedType: string;
  mainNumbers: number[];
  specialNumbers: number[];
  onClose: () => void;
}

export function PrizeAnalysisPanel({
  statistics,
  selectedType,
  mainNumbers,
  specialNumbers,
  onClose,
}: PrizeAnalysisPanelProps) {
  if (!statistics) return null;

  // 调试：检查传入的数据
  console.log("PrizeAnalysisPanel received data:", {
    mainNumbers,
    specialNumbers,
    selectedType,
    recordsCount: statistics.records.length,
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("zh-CN").format(num);
  };

  // 计算投注数量
  const calculateBetCount = () => {
    if (selectedType === "dlt") {
      // 大乐透：前区5个+后区2个为标准单式
      // 如果前区超过5个或后区超过2个，需要计算复式注数
      const mainCount = mainNumbers.length;
      const specialCount = specialNumbers.length;

      if (mainCount === 5 && specialCount === 2) {
        return 1; // 单式
      } else {
        // 复式计算：C(mainCount,5) × C(specialCount,2)
        const mainCombos = mainCount >= 5 ? combination(mainCount, 5) : 0;
        const specialCombos =
          specialCount >= 2 ? combination(specialCount, 2) : 0;
        return mainCombos * specialCombos;
      }
    } else if (selectedType === "ssq") {
      // 双色球：6个红球+1个蓝球为标准单式
      const mainCount = mainNumbers.length;
      const specialCount = specialNumbers.length;

      if (mainCount === 6 && specialCount === 1) {
        return 1; // 单式
      } else {
        // 复式计算：C(mainCount,6) × specialCount
        const mainCombos = mainCount >= 6 ? combination(mainCount, 6) : 0;
        return mainCombos * specialCount;
      }
    } else if (selectedType === "kl8") {
      // 快乐8：标准选10个号码
      const mainCount = mainNumbers.length;

      if (mainCount === 10) {
        return 1; // 单式
      } else {
        // 简化处理：超过10个号码按复式计算
        return mainCount >= 10 ? combination(mainCount, 10) : 0;
      }
    }

    return 1; // 默认1注
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
    return calculateBetCount() * statistics.totalDraws * 2; // 每注2元
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  往期中奖分析
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  分析您的选号在历史开奖中的表现
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 当前选号展示 */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
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
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm flex items-center justify-center font-bold shadow-md"
                  >
                    {num}
                  </div>
                ))}
                {specialNumbers.length > 0 && (
                  <>
                    <span className="text-lg font-bold text-gray-400 mx-2">
                      +
                    </span>
                    {specialNumbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm flex items-center justify-center font-bold shadow-md"
                      >
                        {num}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 智能分析仪表板 */}
          <div className="space-y-4">
            {/* 投资回报总览 */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    投资回报分析
                  </h3>
                  <div className="flex items-baseline gap-4">
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(
                        statistics.totalPrizeAmount - calculateTotalCost()
                      )}
                    </div>
                    <div
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        statistics.totalPrizeAmount > calculateTotalCost()
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {statistics.totalPrizeAmount > calculateTotalCost()
                        ? "盈利"
                        : "亏损"}{" "}
                      {Math.abs(
                        Math.round(
                          ((statistics.totalPrizeAmount -
                            calculateTotalCost()) /
                            calculateTotalCost()) *
                            100
                        )
                      )}
                      %
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span>
                      收入: {formatCurrency(statistics.totalPrizeAmount)}
                    </span>
                    <span>成本: {formatCurrency(calculateTotalCost())}</span>
                    <span>
                      投注: {calculateBetCount()}注×{statistics.totalDraws}期
                    </span>
                  </div>
                </div>
                <div className="w-24 h-24">
                  <div className="relative w-full h-full">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-200 dark:text-slate-700"
                      ></circle>
                      <circle
                        cx="48"
                        cy="48"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          36 *
                          (1 - Math.min(statistics.winningRate / 100, 1))
                        }`}
                        className={`${
                          statistics.winningRate > 20
                            ? "text-emerald-500"
                            : statistics.winningRate > 10
                            ? "text-yellow-500"
                            : "text-red-500"
                        } transition-all duration-500`}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {Math.round(statistics.winningRate)}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          中奖率
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 详细统计网格 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 中奖表现 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    中奖表现
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      中奖次数
                    </span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {statistics.winningDraws}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      开奖期数
                    </span>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {formatNumber(statistics.totalDraws)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      命中概率
                    </span>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {Math.round(statistics.winningRate)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 奖金统计 */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                    奖金统计
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      累计奖金
                    </span>
                    <span className="text-lg font-bold text-amber-900 dark:text-amber-100 truncate">
                      {formatCurrency(statistics.totalPrizeAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      最高奖金
                    </span>
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200 truncate">
                      {formatCurrency(statistics.maxPrizeAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      平均奖金
                    </span>
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {formatCurrency(statistics.averagePrizeAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 投注分析 */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                    投注分析
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      投注注数
                    </span>
                    <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {calculateBetCount()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      单注成本
                    </span>
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      2元
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      最高期号
                    </span>
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      {statistics.maxPrizeIssue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 中奖记录 */}
          {statistics.records.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    中奖记录
                    <Badge variant="secondary" className="text-xs">
                      {statistics.records.length} 期
                    </Badge>
                  </span>
                  <span className="text-sm text-gray-500">最近100期数据</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics.records.map((record, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {record.issue}
                          </Badge>
                          <Badge
                            variant={
                              record.prizeAmount >= 1000000
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs font-bold"
                          >
                            {record.prize}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                            {formatCurrency(record.prizeAmount)}
                          </div>
                          {record.drawDate && (
                            <div className="text-xs text-gray-500">
                              {record.drawDate}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 详细中奖情况 */}
                      {record.prizeBreakdown && (
                        <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            中奖详情
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {record.prizeBreakdown.map((breakdown, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-yellow-300 dark:border-yellow-700"
                              >
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {breakdown.level}:
                                </span>
                                <span className="font-bold text-orange-600 dark:text-orange-400">
                                  {breakdown.count}注
                                </span>
                                <span className="text-gray-500">
                                  ({formatCurrency(breakdown.amount)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">命中:</span>
                          <span className="font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                            {record.matches.main}个号码
                          </span>
                          {record.matches.special > 0 && (
                            <span className="font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                              +{record.matches.special}特
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">开奖:</span>
                          <div className="flex items-center gap-1">
                            {selectedType === "kl8" ? (
                              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {record.drawNumbers.main.length}个号码
                              </span>
                            ) : (
                              <>
                                {record.drawNumbers.main
                                  .slice(0, 6)
                                  .map((num, idx) => (
                                    <div
                                      key={idx}
                                      className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center font-bold"
                                    >
                                      {num}
                                    </div>
                                  ))}
                                {record.drawNumbers.main.length > 6 && (
                                  <span className="text-xs text-gray-500">
                                    +{record.drawNumbers.main.length - 6}
                                  </span>
                                )}
                                {record.drawNumbers.special.length > 0 && (
                                  <>
                                    <span className="text-gray-400 mx-1">
                                      +
                                    </span>
                                    {record.drawNumbers.special.map(
                                      (num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-bold"
                                        >
                                          {num}
                                        </div>
                                      )
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <TrendingDown className="h-20 w-20 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  暂无中奖记录
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  您的选号在最近100期开奖中暂未中过奖，继续坚持，好运就在下一期！
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
