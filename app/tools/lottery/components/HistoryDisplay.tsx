"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";

interface HistoryDisplayProps {
  dltHistoryData: any[];
  ssqHistoryData: any[];
  historyLoading: boolean;
}

export default function HistoryDisplay({
  dltHistoryData,
  ssqHistoryData,
  historyLoading,
}: HistoryDisplayProps) {
  if (historyLoading) {
    return (
      <Card className="border-border/50 shadow-xl shadow-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            开奖历史
          </CardTitle>
          <CardDescription>
            大乐透和双色球最近50期开奖记录（数据来源：新浪彩票）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-muted-foreground">加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dltHistoryData.length === 0 && ssqHistoryData.length === 0) {
    return (
      <Card className="border-border/50 shadow-xl shadow-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            开奖历史
          </CardTitle>
          <CardDescription>
            大乐透和双色球最近50期开奖记录（数据来源：新浪彩票）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            暂无数据
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-xl shadow-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          开奖历史
        </CardTitle>
        <CardDescription>
          大乐透和双色球最近50期开奖记录（数据来源：新浪彩票）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* 两列布局：大乐透和双色球并排显示 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 大乐透历史 */}
            {dltHistoryData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  大乐透开奖历史 ({dltHistoryData.length}期)
                </h3>
                <div className="space-y-2 h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {dltHistoryData
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div
                        key={item.issue}
                        className="p-3 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg border border-border hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 min-w-[80px]">
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              第 {item.issue} 期
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {item.numbers.map((num: number, idx: number) => (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-xs shadow-sm"
                              >
                                {num}
                              </div>
                            ))}
                            <span className="text-sm font-bold text-muted-foreground mx-1">
                              +
                            </span>
                            {item.specialNumbers.map(
                              (num: number, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                >
                                  {num}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 双色球历史 */}
            {ssqHistoryData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  双色球开奖历史 ({ssqHistoryData.length}期)
                </h3>
                <div className="space-y-2 h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {ssqHistoryData
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div
                        key={item.issue}
                        className="p-3 bg-linear-to-r from-red-500/5 via-pink-500/5 to-rose-500/5 rounded-lg border border-border hover:border-red-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 min-w-20">
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                              第 {item.issue} 期
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {item.redBalls.map((num: string, idx: number) => (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-600 border border-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                              >
                                {num}
                              </div>
                            ))}
                            <span className="text-sm font-bold text-muted-foreground mx-1">
                              +
                            </span>
                            <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                              {item.blueBall}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 数据统计信息 */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>
              显示全部 {dltHistoryData.length + ssqHistoryData.length}{" "}
              期历史数据
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
