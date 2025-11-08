import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Copy,
  Save,
  Scale,
  Settings,
  Shuffle,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LOTTERY_CONFIGS, LotteryType } from "../../constants";
import { HistoryRecord } from "../../types";
import HistoryPanelMobile from "./HistoryPanelMobile";
import { useLotteryStore } from "@/lib/stores/lottery/lottery-store";

interface NumberOperationsMobileProps {
  copied: boolean;
  saved: boolean;
  generateSmartNumbers: () => void;
  onHistoryUpdate: (records: HistoryRecord[]) => void;
  saveNumbers: () => void;
  copyNumbers: () => void;
}
const NumberOperationsMobile = ({
  copied,
  saved,
  generateSmartNumbers,
  saveNumbers,
  copyNumbers,
}: NumberOperationsMobileProps) => {
  const selectedType = useLotteryStore((state) => state.selectedType);
  const algorithm = useLotteryStore((state) => state.algorithm);
  const setAlgorithm = useLotteryStore((state) => state.setAlgorithm);
  const setSelectedType = useLotteryStore((state) => state.setSelectedType);

  return (
    <>
      <div className="md:hidden mt-2 flex gap-x-3 w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="flex-1  bg-linear-to-r from-blue-500  to-blue-600 text-white hover:opacity-90 transition-all shadow-lg h-12"
              size="lg"
            >
              <Settings className="h-5 w-5 mr-2" />
              选号参数设置
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
            <div className="space-y-6 mt-6">
              {/* 彩票类型选择 */}
              <Card>
                <CardHeader>
                  <CardTitle>彩票类型</CardTitle>
                  <CardDescription>选择彩票类型</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map(
                      (type) => (
                        <Button
                          key={type}
                          variant={
                            selectedType === type ? "default" : "outline"
                          }
                          onClick={() => setSelectedType(type)}
                          className="h-12 text-sm"
                        >
                          {LOTTERY_CONFIGS[type].name}
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 算法选择 */}
              <Card>
                <CardHeader>
                  <CardTitle>选号算法</CardTitle>
                  <CardDescription>选择号码生成算法</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={algorithm === "random" ? "default" : "outline"}
                        onClick={() => setAlgorithm("random")}
                        className="h-12 text-sm"
                      >
                        <Shuffle className="w-4 h-4 mr-2" />
                        随机
                      </Button>
                      <Button
                        variant={
                          algorithm === "frequency" ? "default" : "outline"
                        }
                        onClick={() => setAlgorithm("frequency")}
                        className="h-12 text-sm"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        高频
                      </Button>
                      <Button
                        variant={
                          algorithm === "omission" ? "default" : "outline"
                        }
                        onClick={() => setAlgorithm("omission")}
                        className="h-12 text-sm"
                      >
                        <TrendingDown className="w-4 h-4 mr-2" />
                        冷门
                      </Button>
                      <Button
                        variant={
                          algorithm === "balanced" ? "default" : "outline"
                        }
                        onClick={() => setAlgorithm("balanced")}
                        className="h-12 text-sm"
                      >
                        <Scale className="w-4 h-4 mr-2" />
                        均衡
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          size="lg"
          className="flex-1 bg-linear-to-r from-amber-500  to-pink-500 text-white hover:opacity-90 transition-all shadow-lg h-12"
          onClick={generateSmartNumbers}
        >
          <Sparkles className="h-5 w-5 mr-2" />
          生成号码
        </Button>
      </div>
      <div className=" md:hidden shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2">
            {/* 复制按钮 */}
            <Button
              onClick={copyNumbers}
              className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all text-sm h-12"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "已复制" : "复制号码"}
            </Button>

            {/* 保存按钮 */}
            <Button
              onClick={saveNumbers}
              className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 transition-all text-sm h-12"
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {saved ? "已保存" : "保存选号"}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <HistoryPanelMobile />
      </div>
    </>
  );
};

export default NumberOperationsMobile;
