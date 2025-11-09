"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateKL8BetAmount, calculateKL8BetCount, validateKL8BetLimit } from "../constants";
import {
  calculateKL8Prize,
  getKL8AllPrizeOptions,
  validateKL8CalculationParams,
  KL8PrizeResult,
  KL8CalculationParams
} from "../utils/kl8-calculator";

export function KL8PrizeCalculator() {
  const [gameType, setGameType] = useState<number>(10); // 玩法：选一、选二...选十
  const [selectedCount, setSelectedCount] = useState<number>(10); // 实际选择的号码数量
  const [matchCount, setMatchCount] = useState<number>(0);
  const [result, setResult] = useState<KL8PrizeResult | null>(null);
  const [error, setError] = useState<string>("");

  // 当玩法或选择数量改变时，重置相关状态
  useEffect(() => {
    setMatchCount(0);
    setResult(null);
    setError("");
    // 确保选择的号码数量不小于玩法要求
    if (selectedCount < gameType) {
      setSelectedCount(gameType);
    }
  }, [gameType, selectedCount]);

  // 计算奖金
  const handleCalculate = () => {
    const params: KL8CalculationParams = {
      selectedCount: gameType, // 使用玩法来计算奖金
      matchCount,
    };

    const validation = validateKL8CalculationParams(params);
    if (!validation.isValid) {
      setError(validation.error || "参数无效");
      setResult(null);
      return;
    }

    setError("");
    const prizeResult = calculateKL8Prize(params);
    setResult(prizeResult);
  };

  // 获取所有奖金选项
  const prizeOptions = getKL8AllPrizeOptions(gameType);

  // 验证投注限制
  const betValidation = validateKL8BetLimit(selectedCount, gameType);

  return (
    <div className="space-y-6">
      {/* 游戏规则说明 */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
            福彩快乐8游戏规则
          </CardTitle>
          <CardDescription>
            从1-80中选择{selectedCount}个号码进行"选{gameType}"玩法投注，开奖时从80个号码中摇出20个号码。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>您的投注号码与开奖号码匹配的数量决定中奖金额。单注最高2万元。</p>
        </CardContent>
      </Card>

      {/* 投注参数设置 */}
      <Card>
        <CardHeader>
          <CardTitle>投注设置</CardTitle>
          <CardDescription>
            设置您的投注号码数量和匹配的开奖号码数量
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 玩法选择 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              选择玩法
            </Label>
            <Select
              value={gameType.toString()}
              onValueChange={(value) => setGameType(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    选{num}玩法
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 选择号码数量 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              选择号码数量：{selectedCount}个
            </Label>
            <Slider
              value={[selectedCount]}
              onValueChange={(value) => setSelectedCount(value[0])}
              max={16}
              min={gameType}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{gameType}个（最少）</span>
              <span>16个（最多）</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>投注金额：¥{calculateKL8BetAmount(selectedCount, gameType)}
              {selectedCount === gameType && "（单式投注）"}
              {selectedCount > gameType && `（${calculateKL8BetCount(selectedCount, gameType)}注复式）`}
              {selectedCount < gameType && "（投注未完成）"}
              </p>
            </div>

            {/* 投注限制提示 */}
            {!betValidation.isValid && (
              <div className="text-sm text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 rounded-md p-2 border border-red-200 dark:border-red-800">
                {betValidation.errorMessage}
              </div>
            )}
          </div>

          {/* 匹配号码数量 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              匹配开奖号码数量：{matchCount}个
            </Label>
            <Slider
              value={[matchCount]}
              onValueChange={(value) => setMatchCount(value[0])}
              max={gameType}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0个</span>
              <span>{gameType}个（最多匹配）</span>
            </div>
          </div>

          {/* 计算按钮 */}
          <Button
            onClick={handleCalculate}
            className="w-full"
            size="lg"
          >
            计算奖金
          </Button>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 计算结果 */}
      {result && (
        <Card className={result.prizeAmount > 0 ? "border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-800"}>
          <CardHeader>
            <CardTitle className="text-lg">
              计算结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">玩法：</span>
                <span className="font-medium ml-1">选{gameType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">匹配：</span>
                <span className="font-medium ml-1">{matchCount}个号码</span>
              </div>
              <div>
                <span className="text-muted-foreground">选择号码：</span>
                <span className="font-medium ml-1">{selectedCount}个</span>
              </div>
              <div>
                <span className="text-muted-foreground">投注金额：</span>
                <span className="font-medium ml-1">¥{calculateKL8BetAmount(selectedCount, gameType)}</span>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {result.prize}
              </div>
              {result.prizeAmount > 0 && (
                <div className="text-lg text-green-600 dark:text-green-400">
                  ¥{result.prizeAmount.toLocaleString()}
                </div>
              )}
              {result.isFloatingPrize && (
                <div className="text-sm text-muted-foreground mt-2">
                  浮动奖金根据当期奖池和中奖注数确定
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 奖金表 */}
      <Card>
        <CardHeader>
          <CardTitle>选{gameType}玩法奖金表</CardTitle>
          <CardDescription>
            所有匹配情况对应的奖金金额（单注2元）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {prizeOptions.map((option) => (
              <div
                key={option.matchCount}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  matchCount === option.matchCount
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Badge variant={option.matchCount === matchCount ? "default" : "secondary"}>
                    匹配{option.matchCount}个
                  </Badge>
                  {option.matchCount === selectedCount && (
                    <Badge variant="outline" className="text-xs">
                      全中
                    </Badge>
                  )}
                </div>
                <div className="font-medium">
                  {typeof option.prize === 'string' ? (
                    <span className="text-blue-600 dark:text-blue-400">{option.prize}</span>
                  ) : (
                    <span className={option.prize > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                      {option.prize > 0 ? `¥${option.prize.toLocaleString()}` : option.prize === 0 ? "未中奖" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}