"use client";

import { useState, useEffect, useCallback } from "react";
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
import { 
  Copy, 
  Palette, 
  Droplets,
  Check,
  AlertCircle
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import { HexColorPicker } from "react-colorful";

// 颜色转换函数
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
};

const hexToHsl = (hex: string): [number, number, number] | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(...rgb);
};

const hslToHex = (h: number, s: number, l: number): string => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(...rgb);
};

// 生成颜色变体
const generateColorVariants = (hex: string): { [key: string]: string } => {
  const hsl = hexToHsl(hex);
  if (!hsl) return {};
  
  const [h, s, l] = hsl;
  const variants: { [key: string]: string } = {};
  
  // 生成不同明度的颜色变体
  const lightnessLevels = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
  lightnessLevels.forEach(level => {
    variants[`L${level}`] = hslToHex(h, s, level);
  });
  
  return variants;
};

// 颜色格式验证
const isValidHex = (hex: string): boolean => {
  return /^#?[0-9A-F]{6}$/i.test(hex);
};

const isValidRgb = (rgb: string): boolean => {
  const match = rgb.match(/^rgb?\(?(\d{1,3}),?\s*(\d{1,3}),?\s*(\d{1,3})\)?$/i);
  if (!match) return false;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
};

const isValidHsl = (hsl: string): boolean => {
  const match = hsl.match(/^hsl?\(?(\d{1,3}),?\s*(\d{1,3})%?,?\s*(\d{1,3})%?\)?$/i);
  if (!match) return false;
  
  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = parseInt(match[3]);
  
  return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
};

export default function ColorPickerPage() {
  const [colorInput, setColorInput] = useState("#3B82F6");
  const [hexColor, setHexColor] = useState("#3B82F6");
  const [rgbColor, setRgbColor] = useState("rgb(59, 130, 246)");
  const [hslColor, setHslColor] = useState("hsl(217, 91%, 60%)");
  const [colorVariants, setColorVariants] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const { addRecentlyUsedTool } = useUserPreferencesStore();

  // 记录最近使用的工具
  useEffect(() => {
    addRecentlyUsedTool("color-picker");
  }, [addRecentlyUsedTool]);

  // 解析颜色输入
  const parseColorInput = useCallback((input: string) => {
    setError(null);
    
    // 移除所有空格
    const cleanInput = input.replace(/\s/g, '');
    
    try {
      if (isValidHex(cleanInput)) {
        const hex = cleanInput.startsWith('#') ? cleanInput : `#${cleanInput}`;
        const rgb = hexToRgb(hex);
        if (!rgb) throw new Error("Invalid hex color");
        
        const [r, g, b] = rgb;
        const hsl = rgbToHsl(r, g, b);
        if (!hsl) throw new Error("Failed to convert to HSL");
        
        const [h, s, l] = hsl;
        
        setHexColor(hex.toUpperCase());
        setRgbColor(`rgb(${r}, ${g}, ${b})`);
        setHslColor(`hsl(${h}, ${s}%, ${l}%)`);
        setColorVariants(generateColorVariants(hex));
        return;
      }
      
      if (isValidRgb(cleanInput)) {
        const match = cleanInput.match(/^rgb?\(?(\d{1,3}),?\s*(\d{1,3}),?\s*(\d{1,3})\)?$/i);
        if (!match) throw new Error("Invalid RGB format");
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        const hex = rgbToHex(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        if (!hsl) throw new Error("Failed to convert to HSL");
        
        const [h, s, l] = hsl;
        
        setHexColor(hex);
        setRgbColor(`rgb(${r}, ${g}, ${b})`);
        setHslColor(`hsl(${h}, ${s}%, ${l}%)`);
        setColorVariants(generateColorVariants(hex));
        return;
      }
      
      if (isValidHsl(cleanInput)) {
        const match = cleanInput.match(/^hsl?\(?(\d{1,3}),?\s*(\d{1,3})%?,?\s*(\d{1,3})%?\)?$/i);
        if (!match) throw new Error("Invalid HSL format");
        
        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);
        
        const rgb = hslToRgb(h, s, l);
        const [r, g, b] = rgb;
        const hex = rgbToHex(r, g, b);
        
        setHexColor(hex);
        setRgbColor(`rgb(${r}, ${g}, ${b})`);
        setHslColor(`hsl(${h}, ${s}%, ${l}%)`);
        setColorVariants(generateColorVariants(hex));
        return;
      }
      
      throw new Error("Invalid color format");
    } catch (err) {
      setError((err as Error).message || "Invalid color format");
      setHexColor("#000000");
      setRgbColor("rgb(0, 0, 0)");
      setHslColor("hsl(0, 0%, 0%)");
      setColorVariants({});
    }
  }, []);

  // 处理颜色输入变化
  const handleColorInputChange = (value: string) => {
    setColorInput(value);
    parseColorInput(value);
  };

  // 处理颜色选择器变化
  const handleColorPickerChange = (color: string) => {
    setColorInput(color);
    parseColorInput(color);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  // 初始化颜色
  useEffect(() => {
    parseColorInput(colorInput);
  }, [colorInput, parseColorInput]);

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
            <Palette className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Color Picker & Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert between color formats and explore color variations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Color Picker */}
          <Card className="border-border/50 shadow-xl shadow-purple-500/5 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Picker
              </CardTitle>
              <CardDescription>
                Select a color or enter a color value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <HexColorPicker 
                  color={hexColor} 
                  onChange={handleColorPickerChange} 
                  className="w-full max-w-xs"
                />
                
                <div 
                  className="w-full h-16 rounded-lg mt-6 border border-border flex items-center justify-center"
                  style={{ backgroundColor: hexColor }}
                >
                  <span className="text-sm font-medium bg-white/80 px-2 py-1 rounded">
                    {hexColor}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color-input">Color Input</Label>
                <Input
                  id="color-input"
                  value={colorInput}
                  onChange={(e) => handleColorInputChange(e.target.value)}
                  placeholder="Enter HEX, RGB, or HSL color"
                  className="font-mono"
                />
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Color Information */}
          <div className="space-y-8 lg:col-span-2">
            {/* Color Formats */}
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Color Formats
                </CardTitle>
                <CardDescription>
                  Various representations of the selected color
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>HEX</Label>
                    <div className="flex gap-2">
                      <Input
                        value={hexColor}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(hexColor, "hex")}
                      >
                        <Copy className="h-4 w-4" />
                        {copied["hex"] && <Check className="h-4 w-4 text-green-500 absolute" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>RGB</Label>
                    <div className="flex gap-2">
                      <Input
                        value={rgbColor}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(rgbColor, "rgb")}
                      >
                        <Copy className="h-4 w-4" />
                        {copied["rgb"] && <Check className="h-4 w-4 text-green-500 absolute" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>HSL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={hslColor}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(hslColor, "hsl")}
                      >
                        <Copy className="h-4 w-4" />
                        {copied["hsl"] && <Check className="h-4 w-4 text-green-500 absolute" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Variants */}
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Color Variants
                </CardTitle>
                <CardDescription>
                  Different lightness variations of the selected color
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(colorVariants).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="w-full h-16 rounded-lg border border-border cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: value }}
                        onClick={() => handleColorPickerChange(value)}
                      />
                      <div className="text-center">
                        <p className="text-xs font-mono">{key}</p>
                        <p className="text-xs font-mono text-muted-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <CardTitle>Color Format Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-semibold mb-2">HEX Format</h4>
                    <p className="text-sm text-muted-foreground">
                      Examples: #FF5733, #000, #FFF
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-semibold mb-2">RGB Format</h4>
                    <p className="text-sm text-muted-foreground">
                      Examples: rgb(255, 87, 51), rgb(0,0,0)
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-semibold mb-2">HSL Format</h4>
                    <p className="text-sm text-muted-foreground">
                      Examples: hsl(14, 100%, 60%), hsl(0,0%,0%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}