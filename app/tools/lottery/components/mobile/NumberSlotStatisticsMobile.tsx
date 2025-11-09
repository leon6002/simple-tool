/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryConfig, LotteryStatistics, LotteryType } from "../../types";

interface NumberSlotStatisticsMobileProps {
  selectedType: LotteryType;
  config: LotteryConfig;
  lotteryHistoryData: any[];
  ssqHistoryData: any[];
  statistics: LotteryStatistics;
}

export const NumberSlotStatisticsMobile = ({
  selectedType,
  config,
  lotteryHistoryData,
  ssqHistoryData,
  statistics,
}: NumberSlotStatisticsMobileProps) => {
  // 获取指定位置的号码频率统计
  const getPositionFrequencies = (
    positionIdx: number,
    isSpecial: boolean = false
  ) => {
    const positionFrequencies: { [key: number]: number } = {};
    const historyData =
      selectedType === "dlt" ? lotteryHistoryData : ssqHistoryData;

    // 根据统计范围筛选数据
    const limitedHistoryData = statistics.rangeData || historyData;

    limitedHistoryData.forEach((record) => {
      let numbers: number[] = [];
      if (isSpecial) {
        numbers = record.specialNumbers || record.blueBalls || [];
      } else {
        numbers = record.numbers || record.redBalls || record.mainNumbers || [];
      }

      if (numbers[positionIdx] !== undefined) {
        const num = numbers[positionIdx];
        positionFrequencies[num] = (positionFrequencies[num] || 0) + 1;
      }
    });

    // 按频次排序，取前10个
    return Object.entries(positionFrequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([num, freq]) => ({ num: parseInt(num), freq }));
  };

  // 渲染号码频率条形图
  const renderFrequencyBars = (
    topNumbers: { num: number; freq: number }[],
    maxFreq: number
  ) => {
    return (
      <div className="space-y-1">
        {topNumbers.map(({ num, freq }) => {
          const percentage = maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
          return (
            <div key={num} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-5 text-right">
                {num}
              </span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(percentage, 5)}%`,
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-6 text-left">
                {freq}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-amber-200/50 dark:border-amber-800/30 shadow-lg md:hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-linear-to-r from-amber-400 to-amber-500"></div>
          号位频次统计
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* 前区/红球号位频次 */}
          <div>
            <h5 className="text-xs font-medium text-amber-600 mb-2">
              {selectedType === "dlt" ? "前区" : "红球"}号位
            </h5>

            {/* 在移动端使用垂直列表而非网格布局 */}
            <div className="grid grid-cols-3 space-y-4">
              {Array.from(
                {
                  length: Array.isArray(config.mainCount)
                    ? config.mainCount[1]
                    : config.mainCount,
                },
                (_, positionIdx) => {
                  const topNumbers = getPositionFrequencies(positionIdx, false);
                  const maxFreq =
                    topNumbers.length > 0 ? topNumbers[0].freq : 0;

                  return (
                    <div
                      key={positionIdx}
                      className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0"
                    >
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        第{positionIdx + 1}位
                      </div>
                      {renderFrequencyBars(topNumbers, maxFreq)}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* 后区/蓝球号位频次 */}
          {config.specialCount && (
            <div>
              <h5 className="text-xs font-medium text-amber-600 mb-2">
                {selectedType === "dlt" ? "后区" : "蓝球"}号位
              </h5>

              {/* 在移动端使用垂直列表而非网格布局 */}
              <div className="grid grid-cols-2 space-y-4">
                {Array.from(
                  {
                    length: Array.isArray(config.specialCount)
                      ? config.specialCount[0]
                      : config.specialCount || 1,
                  },
                  (_, positionIdx) => {
                    const topNumbers = getPositionFrequencies(
                      positionIdx,
                      true
                    );
                    const maxFreq =
                      topNumbers.length > 0 ? topNumbers[0].freq : 0;

                    return (
                      <div
                        key={positionIdx}
                        className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0"
                      >
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          第{positionIdx + 1}位
                        </div>
                        {renderFrequencyBars(topNumbers, maxFreq)}
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
