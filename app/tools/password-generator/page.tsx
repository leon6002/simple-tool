"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Copy,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Brain,
  Lock,
  Check,
  X,
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores";

// 常用易记单词
const MEMORABLE_WORDS = [
  "apple",
  "brave",
  "chair",
  "dance",
  "eagle",
  "flame",
  "grape",
  "house",
  "image",
  "juice",
  "knife",
  "lemon",
  "magic",
  "night",
  "ocean",
  "peace",
  "queen",
  "river",
  "smile",
  "tiger",
  "unity",
  "voice",
  "water",
  "xenon",
  "youth",
  "zebra",
  "cloud",
  "dream",
  "earth",
  "flute",
  "green",
  "happy",
  "light",
  "music",
  "north",
  "olive",
  "paper",
  "quick",
  "radio",
  "sweet",
  "trust",
  "urban",
  "value",
  "world",
  "young",
  "amber",
  "blaze",
  "crystal",
  "dragon",
  "forest",
  "garden",
  "harbor",
  "island",
  "jungle",
  "knight",
  "legend",
  "mirror",
  "noble",
  "orange",
  "pirate",
  "quartz",
  "sunset",
];

// 混合词根
const WORD_ROOTS = [
  "act",
  "bell",
  "camp",
  "dark",
  "east",
  "fair",
  "gold",
  "home",
  "iron",
  "jump",
  "kind",
  "love",
  "moon",
  "nice",
  "open",
  "pure",
  "real",
  "star",
  "time",
  "up",
  "view",
  "wind",
  "xray",
  "yard",
  "zone",
  "blue",
  "cool",
  "deep",
  "fire",
  "glow",
  "high",
  "join",
  "keen",
  "live",
  "move",
  "near",
  "over",
  "pink",
  "quit",
  "rose",
  "soft",
  "tall",
  "upon",
  "very",
  "wave",
  "xero",
  "year",
  "zero",
];

// 数字和特殊字符
const NUMBERS = "0123456789";
const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export default function PasswordGeneratorPage() {
  // 复杂密码设置
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
  const [excludeSimilarChars, setExcludeSimilarChars] = useState(false);

  // 易记密码设置
  const [wordCount, setWordCount] = useState(3);
  const [separator, setSeparator] = useState("-");
  const [capitalizeWords, setCapitalizeWords] = useState(true);
  const [addNumber, setAddNumber] = useState(true);

  // 生成的密码
  const [complexPassword, setComplexPassword] = useState("");
  const [memorablePassword, setMemorablePassword] = useState("");

  // UI状态
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [activeTab, setActiveTab] = useState("complex");
  const { addRecentlyUsedTool } = useUserPreferencesStore();

  // 记录最近使用的工具
  useEffect(() => {
    addRecentlyUsedTool("password-generator");
  }, [addRecentlyUsedTool]);

  // 生成复杂密码
  const generateComplexPassword = () => {
    let charset = "";

    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += NUMBERS;
    if (includeSpecialChars) charset += SPECIAL_CHARS;

    // 排除相似字符
    if (excludeSimilarChars) {
      const similarChars = /[l1Io0O]/g;
      charset = charset.replace(similarChars, "");
    }

    if (!charset) {
      setComplexPassword("");
      return;
    }

    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    setComplexPassword(password);
  };

  // 生成易记密码
  const generateMemorablePassword = () => {
    // 随机选择单词
    let words = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * MEMORABLE_WORDS.length);
      let word = MEMORABLE_WORDS[randomIndex];

      if (capitalizeWords) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }

      words.push(word);
    }

    // 用分隔符连接单词
    let password = words.join(separator);

    // 添加数字
    if (addNumber) {
      const randomNumber = Math.floor(Math.random() * 1000);
      password += randomNumber;
    }

    setMemorablePassword(password);
  };

  // 生成所有类型的密码
  const generatePasswords = () => {
    generateComplexPassword();
    generateMemorablePassword();
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  // 初始化生成密码
  useEffect(() => {
    generatePasswords();
  }, []);

  // 密码强度评估
  const evaluatePasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "None", color: "bg-gray-500" };

    let score = 0;

    // 长度评分
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // 字符类型评分
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // 复杂性评分
    if (
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      score += 1;
    }

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
    if (score <= 6) return { score, label: "Strong", color: "bg-green-500" };
    return { score, label: "Very Strong", color: "bg-blue-500" };
  };

  const complexStrength = evaluatePasswordStrength(complexPassword);
  const memorableStrength = evaluatePasswordStrength(memorablePassword);

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <Key className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Password Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate secure passwords or memorable passphrases for your accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <Card className="border-border/50 shadow-xl shadow-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Settings
              </CardTitle>
              <CardDescription>
                Configure options for generating passwords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                <Button
                  variant={activeTab === "complex" ? "default" : "ghost"}
                  className={`flex-1 ${
                    activeTab === "complex"
                      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                      : ""
                  }`}
                  onClick={() => setActiveTab("complex")}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Complex Password
                </Button>
                <Button
                  variant={activeTab === "memorable" ? "default" : "ghost"}
                  className={`flex-1 ${
                    activeTab === "memorable"
                      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                      : ""
                  }`}
                  onClick={() => setActiveTab("memorable")}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Memorable Password
                </Button>
              </div>

              {activeTab === "complex" ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Password Length: {length}</Label>
                      <Badge variant="secondary">{length}</Badge>
                    </div>
                    <Slider
                      value={[length]}
                      onValueChange={(value) => setLength(value[0])}
                      min={6}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="uppercase">
                        Include Uppercase Letters
                      </Label>
                      <Switch
                        id="uppercase"
                        checked={includeUppercase}
                        onCheckedChange={setIncludeUppercase}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="lowercase">
                        Include Lowercase Letters
                      </Label>
                      <Switch
                        id="lowercase"
                        checked={includeLowercase}
                        onCheckedChange={setIncludeLowercase}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="numbers">Include Numbers</Label>
                      <Switch
                        id="numbers"
                        checked={includeNumbers}
                        onCheckedChange={setIncludeNumbers}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="special">
                        Include Special Characters
                      </Label>
                      <Switch
                        id="special"
                        checked={includeSpecialChars}
                        onCheckedChange={setIncludeSpecialChars}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="similar">
                        Exclude Similar Characters
                      </Label>
                      <Switch
                        id="similar"
                        checked={excludeSimilarChars}
                        onCheckedChange={setExcludeSimilarChars}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Number of Words: {wordCount}</Label>
                      <Badge variant="secondary">{wordCount}</Badge>
                    </div>
                    <Slider
                      value={[wordCount]}
                      onValueChange={(value) => setWordCount(value[0])}
                      min={2}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="separator">Word Separator</Label>
                      <Input
                        id="separator"
                        value={separator}
                        onChange={(e) => setSeparator(e.target.value)}
                        className="mt-2"
                        placeholder="e.g., -, _, ."
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="capitalize">Capitalize Words</Label>
                      <Switch
                        id="capitalize"
                        checked={capitalizeWords}
                        onCheckedChange={setCapitalizeWords}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="add-number">Add Number</Label>
                      <Switch
                        id="add-number"
                        checked={addNumber}
                        onCheckedChange={setAddNumber}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={generatePasswords}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Generate Passwords
              </Button>
            </CardContent>
          </Card>

          {/* Generated Passwords */}
          <div className="space-y-8">
            {/* Complex Password */}
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Complex Password
                    </CardTitle>
                    <CardDescription>
                      Strong, random password with mixed characters
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePasswordVisibility}
                      className="flex items-center gap-2"
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {showPasswords ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(complexPassword, "complex")
                      }
                      disabled={!complexPassword}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      {copied["complex"] ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-lg break-all">
                  {complexPassword ? (
                    showPasswords ? (
                      complexPassword
                    ) : (
                      "•".repeat(complexPassword.length)
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Click generate to create a password
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Strength:</span>
                    <span
                      className={`font-semibold ${
                        complexStrength.label === "Weak"
                          ? "text-red-500"
                          : complexStrength.label === "Medium"
                          ? "text-yellow-500"
                          : complexStrength.label === "Strong"
                          ? "text-green-500"
                          : "text-blue-500"
                      }`}
                    >
                      {complexStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${complexStrength.color}`}
                      style={{ width: `${(complexStrength.score / 7) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memorable Password */}
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Memorable Password
                    </CardTitle>
                    <CardDescription>
                      Easy-to-remember passphrase with words
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePasswordVisibility}
                      className="flex items-center gap-2"
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {showPasswords ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(memorablePassword, "memorable")
                      }
                      disabled={!memorablePassword}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      {copied["memorable"] ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-lg break-all">
                  {memorablePassword ? (
                    showPasswords ? (
                      memorablePassword
                    ) : (
                      "•".repeat(memorablePassword.length)
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Click generate to create a password
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Strength:</span>
                    <span
                      className={`font-semibold ${
                        memorableStrength.label === "Weak"
                          ? "text-red-500"
                          : memorableStrength.label === "Medium"
                          ? "text-yellow-500"
                          : memorableStrength.label === "Strong"
                          ? "text-green-500"
                          : "text-blue-500"
                      }`}
                    >
                      {memorableStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${memorableStrength.color}`}
                      style={{
                        width: `${(memorableStrength.score / 7) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Password Tips */}
        <Card className="mt-8 border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Password Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Use Strong Passwords</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Include uppercase, lowercase, numbers, and special
                    characters
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Unique Passwords</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use different passwords for each account
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Password Manager</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consider using a password manager to store passwords
                    securely
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable 2FA wherever possible for extra security
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
