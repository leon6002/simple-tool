"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HardDrive, Copy, RotateCcw, Info } from "lucide-react";

type ByteUnit =
  | "bit"
  | "byte"
  | "KB"
  | "MB"
  | "GB"
  | "TB"
  | "PB"
  | "KiB"
  | "MiB"
  | "GiB"
  | "TiB"
  | "PiB";

interface UnitInfo {
  name: string;
  label: string;
  toBits: number; // 转换为 bits 的乘数
  description: string;
  color: string;
}

const units: Record<ByteUnit, UnitInfo> = {
  bit: {
    name: "bit",
    label: "Bit",
    toBits: 1,
    description: "最小的数据单位",
    color: "from-gray-500 to-gray-600",
  },
  byte: {
    name: "byte",
    label: "Byte (B)",
    toBits: 8,
    description: "8 bits = 1 byte",
    color: "from-blue-500 to-blue-600",
  },
  KB: {
    name: "KB",
    label: "Kilobyte (KB)",
    toBits: 8 * 1000,
    description: "1000 bytes (十进制)",
    color: "from-green-500 to-green-600",
  },
  MB: {
    name: "MB",
    label: "Megabyte (MB)",
    toBits: 8 * 1000 * 1000,
    description: "1000 KB (十进制)",
    color: "from-yellow-500 to-yellow-600",
  },
  GB: {
    name: "GB",
    label: "Gigabyte (GB)",
    toBits: 8 * 1000 * 1000 * 1000,
    description: "1000 MB (十进制)",
    color: "from-orange-500 to-orange-600",
  },
  TB: {
    name: "TB",
    label: "Terabyte (TB)",
    toBits: 8 * 1000 * 1000 * 1000 * 1000,
    description: "1000 GB (十进制)",
    color: "from-red-500 to-red-600",
  },
  PB: {
    name: "PB",
    label: "Petabyte (PB)",
    toBits: 8 * 1000 * 1000 * 1000 * 1000 * 1000,
    description: "1000 TB (十进制)",
    color: "from-purple-500 to-purple-600",
  },
  KiB: {
    name: "KiB",
    label: "Kibibyte (KiB)",
    toBits: 8 * 1024,
    description: "1024 bytes (二进制)",
    color: "from-teal-500 to-teal-600",
  },
  MiB: {
    name: "MiB",
    label: "Mebibyte (MiB)",
    toBits: 8 * 1024 * 1024,
    description: "1024 KiB (二进制)",
    color: "from-cyan-500 to-cyan-600",
  },
  GiB: {
    name: "GiB",
    label: "Gibibyte (GiB)",
    toBits: 8 * 1024 * 1024 * 1024,
    description: "1024 MiB (二进制)",
    color: "from-indigo-500 to-indigo-600",
  },
  TiB: {
    name: "TiB",
    label: "Tebibyte (TiB)",
    toBits: 8 * 1024 * 1024 * 1024 * 1024,
    description: "1024 GiB (二进制)",
    color: "from-pink-500 to-pink-600",
  },
  PiB: {
    name: "PiB",
    label: "Pebibyte (PiB)",
    toBits: 8 * 1024 * 1024 * 1024 * 1024 * 1024,
    description: "1024 TiB (二进制)",
    color: "from-rose-500 to-rose-600",
  },
};

export default function ByteConverterPage() {
  const [values, setValues] = useState<Record<ByteUnit, string>>({
    bit: "",
    byte: "",
    KB: "",
    MB: "",
    GB: "",
    TB: "",
    PB: "",
    KiB: "",
    MiB: "",
    GiB: "",
    TiB: "",
    PiB: "",
  });

  const handleInputChange = (unit: ByteUnit, value: string) => {
    // 只允许数字和小数点
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    // 更新当前输入框
    const newValues = { ...values, [unit]: value };

    // 如果输入为空，清空所有其他值
    if (value === "") {
      setValues({
        bit: "",
        byte: "",
        KB: "",
        MB: "",
        GB: "",
        TB: "",
        PB: "",
        KiB: "",
        MiB: "",
        GiB: "",
        TiB: "",
        PiB: "",
      });
      return;
    }

    // 转换为 bits
    const numValue = parseFloat(value);
    const bitsValue = numValue * units[unit].toBits;

    // 转换为所有其他单位
    Object.keys(units).forEach((key) => {
      const targetUnit = key as ByteUnit;
      if (targetUnit !== unit) {
        const converted = bitsValue / units[targetUnit].toBits;
        // 格式化数字，保留合适的小数位数
        newValues[targetUnit] = formatNumber(converted);
      }
    });

    setValues(newValues);
  };

  const formatNumber = (num: number): string => {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.000001) return num.toExponential(6);
    if (Math.abs(num) > 1e15) return num.toExponential(6);

    // 根据数值大小决定小数位数
    if (Math.abs(num) >= 1000) {
      return num.toFixed(2);
    } else if (Math.abs(num) >= 1) {
      return num.toFixed(6).replace(/\.?0+$/, "");
    } else {
      return num.toFixed(10).replace(/\.?0+$/, "");
    }
  };

  const copyToClipboard = (value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
  };

  const reset = () => {
    setValues({
      bit: "",
      byte: "",
      KB: "",
      MB: "",
      GB: "",
      TB: "",
      PB: "",
      KiB: "",
      MiB: "",
      GiB: "",
      TiB: "",
      PiB: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/10 via-green-500/10 to-purple-500/10 border border-blue-500/20"
          >
            <HardDrive className="h-8 w-8 text-blue-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
            Byte Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            在不同的数据单位之间进行转换，支持十进制（KB、MB、GB）和二进制（KiB、MiB、GiB）
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Decimal Units (SI) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  十进制单位 (SI)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  基于 1000 的倍数（常用于存储设备标注）
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {(
                  ["bit", "byte", "KB", "MB", "GB", "TB", "PB"] as ByteUnit[]
                ).map((unit, index) => (
                  <motion.div
                    key={unit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="space-y-2"
                  >
                    <Label
                      htmlFor={unit}
                      className="text-sm font-medium flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full bg-linear-to-r ${units[unit].color}`}
                        />
                        {units[unit].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {units[unit].description}
                      </span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={unit}
                        type="text"
                        value={values[unit]}
                        onChange={(e) =>
                          handleInputChange(unit, e.target.value)
                        }
                        placeholder="输入数值"
                        className="font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(values[unit])}
                        disabled={!values[unit]}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Binary Units (IEC) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  二进制单位 (IEC)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  基于 1024 的倍数（计算机内存实际使用）
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {(
                  ["byte", "KiB", "MiB", "GiB", "TiB", "PiB"] as ByteUnit[]
                ).map((unit, index) => (
                  <motion.div
                    key={unit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="space-y-2"
                  >
                    <Label
                      htmlFor={`binary-${unit}`}
                      className="text-sm font-medium flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full bg-linear-to-r ${units[unit].color}`}
                        />
                        {units[unit].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {units[unit].description}
                      </span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`binary-${unit}`}
                        type="text"
                        value={values[unit]}
                        onChange={(e) =>
                          handleInputChange(unit, e.target.value)
                        }
                        placeholder="输入数值"
                        className="font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(values[unit])}
                        disabled={!values[unit]}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Reset Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            重置所有值
          </Button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-border/50 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-blue-600" />
                关于数据单位
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                <div>
                  <p className="font-medium mb-1">十进制单位 (SI)</p>
                  <p className="text-muted-foreground">
                    使用 1000 作为进制，常用于硬盘、SSD
                    等存储设备的容量标注。例如：1 KB = 1000 bytes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-2 w-2 rounded-full bg-purple-500 shrink-0 mt-2" />
                <div>
                  <p className="font-medium mb-1">二进制单位 (IEC)</p>
                  <p className="text-muted-foreground">
                    使用 1024 作为进制，更接近计算机内部实际使用的方式。例如：1
                    KiB = 1024 bytes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-2 w-2 rounded-full bg-green-500 shrink-0 mt-2" />
                <div>
                  <p className="font-medium mb-1">为什么会有差异？</p>
                  <p className="text-muted-foreground">
                    这就是为什么你买的 1TB 硬盘在系统中只显示约 931 GiB
                    的原因：1 TB = 1000 GB = 1,000,000,000,000 bytes ≈ 931.32
                    GiB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
