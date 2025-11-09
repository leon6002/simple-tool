/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryConfig, LotteryStatistics, LotteryType } from "../../types";

interface NumberSlotStatisticsProps {
  selectedType: LotteryType;
  config: LotteryConfig;
  lotteryHistoryData: any[];
  ssqHistoryData: any[];
  statistics: LotteryStatistics;
}
export const NumberSlotStatistics = ({
  selectedType,
  config,
  lotteryHistoryData,
  ssqHistoryData,
  statistics,
}: NumberSlotStatisticsProps) => {
  return (
    <Card className="border-amber-200/50 dark:border-amber-800/30 shadow-lg hidden md:block">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-linear-to-r from-amber-400 to-amber-500"></div>
          号位频次统计
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`${config.specialCount ? "flex gap-6" : "space-y-3"}`}>
          {/* 前区/红球号位频次 */}
          <div className="flex-1">
            <h5 className="text-xs font-medium text-amber-600 mb-2">
              {selectedType === "dlt" ? "前区" : "红球"}号位
            </h5>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: Array.isArray(config.mainCount) ? config.mainCount[1] : config.mainCount }, (_, positionIdx) => {
                // 获取该号位频次最高的10个号码（使用统计范围内的数据）
                const positionFrequencies: { [key: number]: number } = {};
                const historyData =
                  selectedType === "dlt" ? lotteryHistoryData : ssqHistoryData;

                // 根据统计范围筛选数据
                const limitedHistoryData = statistics.rangeData || historyData;

                limitedHistoryData.forEach((record) => {
                  const numbers =
                    record.numbers ||
                    record.redBalls ||
                    record.mainNumbers ||
                    [];
                  if (numbers[positionIdx] !== undefined) {
                    const num = numbers[positionIdx];
                    positionFrequencies[num] =
                      (positionFrequencies[num] || 0) + 1;
                  }
                });

                // 按频次排序，取前10个
                const topNumbers = Object.entries(positionFrequencies)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([num, freq]) => ({ num: parseInt(num), freq }));

                const maxFreq = topNumbers.length > 0 ? topNumbers[0].freq : 0;

                return (
                  <div key={positionIdx} className="text-center">
                    {/* 号位标题 */}
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      第{positionIdx + 1}位
                    </div>

                    {/* 该号位高频号码 */}
                    <div className="space-y-1">
                      {topNumbers.slice(0, 10).map(({ num, freq }) => {
                        const percentage =
                          maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
                        return (
                          <div key={num} className="flex items-center gap-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400 w-6 text-right">
                              {num}
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(percentage, 5)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-left">
                              {freq}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 后区/蓝球号位频次 */}
          {config.specialCount && (
            <div className="w-48">
              <h5 className="text-xs font-medium text-amber-600 mb-2">
                {selectedType === "dlt" ? "后区" : "蓝球"}号位
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {Array.from(
                  { length: config.specialCount },
                  (_, positionIdx) => {
                    // 获取该号位频次最高的10个号码（使用统计范围内的数据）
                    const positionFrequencies: { [key: number]: number } = {};
                    const historyData =
                      selectedType === "dlt"
                        ? lotteryHistoryData
                        : ssqHistoryData;

                    // 根据统计范围筛选数据
                    const limitedHistoryData =
                      statistics.rangeData || historyData;

                    limitedHistoryData.forEach((record) => {
                      const numbers =
                        record.specialNumbers || record.blueBalls || [];
                      if (numbers[positionIdx] !== undefined) {
                        const num = numbers[positionIdx];
                        positionFrequencies[num] =
                          (positionFrequencies[num] || 0) + 1;
                      }
                    });

                    // 按频次排序，取前10个
                    const topNumbers = Object.entries(positionFrequencies)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([num, freq]) => ({ num: parseInt(num), freq }));

                    const maxFreq =
                      topNumbers.length > 0 ? topNumbers[0].freq : 0;

                    return (
                      <div key={positionIdx} className="text-center">
                        {/* 号位标题 */}
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          第{positionIdx + 1}位
                        </div>

                        {/* 该号位高频号码 */}
                        <div className="space-y-1">
                          {topNumbers.slice(0, 10).map(({ num, freq }) => {
                            const percentage =
                              maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
                            return (
                              <div
                                key={num}
                                className="flex items-center gap-1"
                              >
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-6 text-right">
                                  {num}
                                </span>
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.max(percentage, 5)}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 w-8 text-left">
                                  {freq}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
