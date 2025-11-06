"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Info,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Match {
  match: string;
  index: number;
  groups?: string[];
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");

  // 实时测试正则表达式
  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setIsValid(true);
      setError("");
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setIsValid(true);
      setError("");

      if (!testString) {
        setMatches([]);
        return;
      }

      const results: Match[] = [];
      let match;

      if (flags.includes("g")) {
        // 全局匹配
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          // 防止无限循环
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        // 单次匹配
        match = regex.exec(testString);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(results);
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid regex pattern");
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  // 复制正则表达式
  const copyRegex = () => {
    const regexString = `/${pattern}/${flags}`;
    navigator.clipboard.writeText(regexString);
    toast.success("正则表达式已复制");
  };

  // 高亮显示匹配结果
  const highlightMatches = () => {
    if (!testString || matches.length === 0) {
      return testString;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // 添加未匹配的部分
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {testString.substring(lastIndex, match.index)}
          </span>
        );
      }

      // 添加匹配的部分
      parts.push(
        <mark
          key={`match-${i}`}
          className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5"
        >
          {match.match}
        </mark>
      );

      lastIndex = match.index + match.match.length;
    });

    // 添加剩余的文本
    if (lastIndex < testString.length) {
      parts.push(<span key="text-end">{testString.substring(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          正则表达式测试工具
        </h1>
        <p className="text-muted-foreground text-lg">
          实时测试和调试正则表达式，查看匹配结果和捕获组
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：测试区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 正则表达式输入 - 粘性定位 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-24 z-40"
          >
            <Card className="p-6 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90 border-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">正则表达式</Label>
                  {pattern && (
                    <div className="flex items-center gap-2">
                      {isValid ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          有效
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          无效
                        </Badge>
                      )}
                      {isValid && (
                        <Button size="sm" variant="outline" onClick={copyRegex}>
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <span className="text-2xl text-muted-foreground">/</span>
                  <Input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="输入正则表达式，例如：\d{3}-\d{4}"
                    className={`flex-1 font-mono text-lg ${
                      !isValid ? "border-destructive" : ""
                    }`}
                  />
                  <span className="text-2xl text-muted-foreground">/</span>
                  <Input
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                    placeholder="flags"
                    className="w-20 font-mono text-lg"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive flex items-start gap-2">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>常用标志：</span>
                  <code className="px-2 py-1 bg-muted rounded">g</code> 全局匹配
                  <code className="px-2 py-1 bg-muted rounded">i</code>{" "}
                  忽略大小写
                  <code className="px-2 py-1 bg-muted rounded">m</code> 多行模式
                  <code className="px-2 py-1 bg-muted rounded">s</code>{" "}
                  点号匹配换行
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 测试字符串 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">测试字符串</Label>
                <Textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="输入要测试的文本..."
                  className="min-h-[150px] font-mono"
                />
              </div>
            </Card>
          </motion.div>

          {/* 匹配结果 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">匹配结果</Label>
                  <Badge variant="secondary">{matches.length} 个匹配</Badge>
                </div>

                {testString && (
                  <div className="p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap break-words">
                    {highlightMatches()}
                  </div>
                )}

                {matches.length > 0 && (
                  <div className="space-y-2">
                    {matches.map((match, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            匹配 #{index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            位置: {match.index}
                          </span>
                        </div>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {match.match}
                        </div>
                        {match.groups && match.groups.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground">
                              捕获组:
                            </span>
                            {match.groups.map((group, i) => (
                              <div
                                key={i}
                                className="text-xs font-mono bg-muted/50 p-2 rounded"
                              >
                                ${i + 1}: {group || "(empty)"}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* 右侧：快速参考和示例 */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RegexReference
              onSelectExample={(regex, test) => {
                setPattern(regex);
                setTestString(test);
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// 正则表达式参考组件
function RegexReference({
  onSelectExample,
}: {
  onSelectExample: (regex: string, test: string) => void;
}) {
  return (
    <Card className="p-6">
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basics">
            <BookOpen className="h-4 w-4 mr-1" />
            基础
          </TabsTrigger>
          <TabsTrigger value="examples">
            <Lightbulb className="h-4 w-4 mr-1" />
            示例
          </TabsTrigger>
          <TabsTrigger value="tips">
            <Info className="h-4 w-4 mr-1" />
            技巧
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4 mt-4">
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-base">字符类</h3>
            <div className="space-y-2">
              <RegexItem code="." desc="匹配任意字符（除换行符）" />
              <RegexItem code="\d" desc="匹配数字 [0-9]" />
              <RegexItem code="\w" desc="匹配字母、数字、下划线" />
              <RegexItem code="\s" desc="匹配空白字符" />
              <RegexItem code="[abc]" desc="匹配 a、b 或 c" />
              <RegexItem code="[^abc]" desc="匹配除 a、b、c 外的字符" />
              <RegexItem code="[a-z]" desc="匹配 a 到 z 的字母" />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-base">量词</h3>
            <div className="space-y-2">
              <RegexItem code="*" desc="匹配 0 次或多次" />
              <RegexItem code="+" desc="匹配 1 次或多次" />
              <RegexItem code="?" desc="匹配 0 次或 1 次" />
              <RegexItem code="{n}" desc="匹配恰好 n 次" />
              <RegexItem code="{n,}" desc="匹配至少 n 次" />
              <RegexItem code="{n,m}" desc="匹配 n 到 m 次" />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-base">位置锚点</h3>
            <div className="space-y-2">
              <RegexItem code="^" desc="匹配字符串开头" />
              <RegexItem code="$" desc="匹配字符串结尾" />
              <RegexItem code="\b" desc="匹配单词边界" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-3 mt-4">
          <ExampleItem
            title="邮箱地址"
            regex="[\w.-]+@[\w.-]+\.\w+"
            test="test@example.com, user.name@domain.co.uk"
            onClick={onSelectExample}
          />
          <ExampleItem
            title="手机号码"
            regex="1[3-9]\d{9}"
            test="13812345678, 18900001111"
            onClick={onSelectExample}
          />
          <ExampleItem
            title="URL 地址"
            regex="https?://[\w.-]+\.\w+"
            test="https://example.com, http://test.org"
            onClick={onSelectExample}
          />
          <ExampleItem
            title="IP 地址"
            regex="\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"
            test="192.168.1.1, 10.0.0.1"
            onClick={onSelectExample}
          />
          <ExampleItem
            title="日期格式"
            regex="\d{4}-\d{2}-\d{2}"
            test="2024-01-15, 2023-12-31"
            onClick={onSelectExample}
          />
          <ExampleItem
            title="HTML 标签"
            regex="<[^>]+>"
            test="<div>content</div>, <span class='test'>text</span>"
            onClick={onSelectExample}
          />
        </TabsContent>

        <TabsContent value="tips" className="space-y-3 mt-4 text-sm">
          <TipItem
            icon="💡"
            title="使用捕获组"
            desc="用括号 () 创建捕获组，可以提取匹配的部分"
          />
          <TipItem
            icon="⚡"
            title="非贪婪匹配"
            desc="在量词后加 ? 变为非贪婪，如 .*? 匹配最少字符"
          />
          <TipItem
            icon="🎯"
            title="转义特殊字符"
            desc="使用 \ 转义特殊字符，如 \. 匹配点号"
          />
          <TipItem
            icon="🔍"
            title="测试边界情况"
            desc="测试空字符串、特殊字符等边界情况"
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function RegexItem({ code, desc }: { code: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
      <code className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-xs shrink-0">
        {code}
      </code>
      <span className="text-muted-foreground">{desc}</span>
    </div>
  );
}

function ExampleItem({
  title,
  regex,
  test,
  onClick,
}: {
  title: string;
  regex: string;
  test: string;
  onClick: (regex: string, test: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(regex, test)}
      className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-2"
    >
      <div className="font-semibold text-sm">{title}</div>
      <code className="text-xs bg-muted px-2 py-1 rounded block font-mono">
        /{regex}/
      </code>
      <div className="text-xs text-muted-foreground">{test}</div>
    </button>
  );
}

function TipItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
      <span className="text-2xl shrink-0">{icon}</span>
      <div>
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
