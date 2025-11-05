"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Minimize2,
  Copy,
  RotateCcw,
  ArrowDown,
  CheckCircle,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TextCompressorPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"single-line" | "remove-spaces" | "minimal">(
    "single-line"
  );
  const [preserveLineBreaks, setPreserveLineBreaks] = useState(false);

  // 压缩文本为单行
  const compressToSingleLine = useCallback(
    (text: string, keepLineBreaks: boolean) => {
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      return keepLineBreaks ? lines.join("\\n") : lines.join(" ");
    },
    []
  );

  // 移除所有多余空格
  const removeExtraSpaces = useCallback(
    (text: string, keepLineBreaks: boolean) => {
      const lines = text
        .split("\n")
        .map((line) => line.trim().replace(/\s+/g, " "))
        .filter((line) => line.length > 0);

      return keepLineBreaks ? lines.join("\\n") : lines.join(" ");
    },
    []
  );

  // 最小化(移除所有空格)
  const minimizeText = useCallback((text: string, keepLineBreaks: boolean) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim().replace(/\s+/g, ""))
      .filter((line) => line.length > 0);

    return keepLineBreaks ? lines.join("\\n") : lines.join("");
  }, []);

  // 处理压缩
  const handleCompress = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText("");
      return;
    }

    let result = "";
    switch (mode) {
      case "single-line":
        result = compressToSingleLine(inputText, preserveLineBreaks);
        break;
      case "remove-spaces":
        result = removeExtraSpaces(inputText, preserveLineBreaks);
        break;
      case "minimal":
        result = minimizeText(inputText, preserveLineBreaks);
        break;
    }

    setOutputText(result);
  }, [
    inputText,
    mode,
    preserveLineBreaks,
    compressToSingleLine,
    removeExtraSpaces,
    minimizeText,
  ]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(() => {
    if (!outputText) return;

    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [outputText]);

  // 重置
  const handleReset = useCallback(() => {
    setInputText("");
    setOutputText("");
    setCopied(false);
  }, []);

  // 计算统计信息
  const getStats = useCallback((text: string) => {
    const lines = text.split("\n").length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    return { lines, chars, charsNoSpaces, words };
  }, []);

  const inputStats = getStats(inputText);
  const outputStats = getStats(outputText);

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <Minimize2 className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Text Compressor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compress multi-line text into a single line, remove extra spaces, or
            minimize text
          </p>
        </div>

        {/* Mode Selection */}
        <Card className="mb-6 border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              Compression Mode
            </CardTitle>
            <CardDescription>
              Choose how you want to compress your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={mode} onValueChange={(value: any) => setMode(value)}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Select compression mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single-line">
                  Single Line (Keep Spaces)
                </SelectItem>
                <SelectItem value="remove-spaces">
                  Remove Extra Spaces
                </SelectItem>
                <SelectItem value="minimal">
                  Minimal (Remove All Spaces)
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {mode === "single-line" && (
                <p>
                  • Combines all lines into one, preserving single spaces
                  between words
                </p>
              )}
              {mode === "remove-spaces" && (
                <p>
                  • Combines all lines and removes extra spaces, keeping only
                  single spaces
                </p>
              )}
              {mode === "minimal" && (
                <p>
                  • Removes all line breaks and spaces for maximum compression
                </p>
              )}
            </div>

            {/* Preserve Line Breaks Option */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserve-linebreaks"
                  checked={preserveLineBreaks}
                  onCheckedChange={(checked) =>
                    setPreserveLineBreaks(checked as boolean)
                  }
                />
                <label
                  htmlFor="preserve-linebreaks"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Preserve line breaks as{" "}
                  <code className="px-1 py-0.5 bg-muted rounded text-xs">
                    \n
                  </code>
                </label>
              </div>
              {preserveLineBreaks && (
                <p className="text-xs text-muted-foreground ml-6">
                  Each line will be separated by the literal characters{" "}
                  <code className="px-1 py-0.5 bg-muted rounded">\n</code>{" "}
                  instead of being joined
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6 border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Input Text</CardTitle>
                <CardDescription>
                  Enter or paste your multi-line text
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  {inputStats.lines} {inputStats.lines === 1 ? "line" : "lines"}
                </Badge>
                <Badge variant="outline">{inputStats.words} words</Badge>
                <Badge variant="outline">{inputStats.chars} chars</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your multi-line text here...&#10;Line 1&#10;Line 2&#10;Line 3"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCompress}
                disabled={!inputText.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white"
              >
                <Minimize2 className="h-4 w-4" />
                Compress Text
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Arrow */}
        {outputText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <ArrowDown className="h-6 w-6 text-purple-600" />
            </div>
          </motion.div>
        )}

        {/* Output Section */}
        {outputText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Compressed Text
                    </CardTitle>
                    <CardDescription>
                      Your text has been compressed
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        {outputStats.lines}{" "}
                        {outputStats.lines === 1 ? "line" : "lines"}
                      </Badge>
                      <Badge variant="outline">{outputStats.words} words</Badge>
                      <Badge variant="outline">{outputStats.chars} chars</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm max-h-[300px] overflow-y-auto break-all">
                  {outputText}
                </div>

                {/* Compression Stats */}
                <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">
                      Compression Results
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Lines</div>
                      <div className="font-medium">
                        {inputStats.lines} → {outputStats.lines}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Characters</div>
                      <div className="font-medium">
                        {inputStats.chars} → {outputStats.chars}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Saved</div>
                      <div className="font-medium text-green-600">
                        {inputStats.chars - outputStats.chars} chars
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Reduction</div>
                      <div className="font-medium text-green-600">
                        {inputStats.chars > 0
                          ? (
                              ((inputStats.chars - outputStats.chars) /
                                inputStats.chars) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
