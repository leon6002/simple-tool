"use client";

import { useState, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Heart } from "lucide-react";
import { debounce } from "@/lib/utils/debounce";

type ColorPalette = {
  id: string;
  colors: string[];
  tags: string[];
  text: string;
  likesCount: number;
  normalizedHash: string;
  createdAt: string;
};

export default function ColorPickerPage() {
  const [color, setColor] = useState("#000000");
  const [copied, setCopied] = useState(false);
  const [rgba, setRgba] = useState({ r: 0, g: 0, b: 0, a: 1 });
  const [hsla, setHsla] = useState({ h: 0, s: 0, l: 0, a: 1 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });

  // ColorMagic palette states
  const [paletteQuery, setPaletteQuery] = useState("");
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [paletteError, setPaletteError] = useState<string | null>(null);

  // Convert hex to other color formats
  const hexToRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 1 };
  };

  const rgbaToHsla = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l;
    
    l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h = Math.round(h * 60);
    }
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { h, s, l, a: 1 };
  };

  const rgbaToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    
    c = Math.round((c - k) / (1 - k) * 100);
    m = Math.round((m - k) / (1 - k) * 100);
    y = Math.round((y - k) / (1 - k) * 100);
    k = Math.round(k * 100);
    
    return { c, m, y, k };
  };

  // Update color formats when color changes
  useEffect(() => {
    const newRgba = hexToRgba(color);
    setRgba(newRgba);
    setHsla(rgbaToHsla(newRgba.r, newRgba.g, newRgba.b));
    setCmyk(rgbaToCmyk(newRgba.r, newRgba.g, newRgba.b));
  }, [color]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle manual color input
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove any spaces
    value = value.replace(/\s/g, '');
    
    // Ensure it starts with # for validation
    if (!value.startsWith('#') && value.length > 0) {
      value = '#' + value;
    }
    
    // Validate hex color format
    if (value === '#' || /^#[0-9A-F]{6}$/i.test(value) || /^#[0-9A-F]{3}$/i.test(value)) {
      setColor(value);
    }
    
    // Also update for incomplete values (to allow typing)
    if (value.length <= 7) {
      setColor(value);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchColorPalettes(query);
    }, 500),
    []
  );

  // Fetch color palettes from our API route (which proxies to ColorMagic)
  const fetchColorPalettes = async (query: string) => {
    if (!query.trim()) {
      setPalettes([]);
      return;
    }
    
    setPaletteLoading(true);
    setPaletteError(null);
    
    try {
      const response = await fetch(
        `/api/color-palettes?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch color palettes: ${response.status}`);
      }
      
      const data: ColorPalette[] = await response.json();
      setPalettes(data);
    } catch (err) {
      console.error("Error fetching color palettes:", err);
      setPaletteError("Failed to load color palettes. Please try again.");
    } finally {
      setPaletteLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPaletteQuery(value);
    debouncedSearch(value);
  };

  // Fetch color palettes on component mount with a default query
  useEffect(() => {
    fetchColorPalettes("nature");
  }, []);

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
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Color Picker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick colors, get color codes, and discover beautiful color palettes
          </p>
        </div>

        <div className="space-y-8">
          {/* Color Picker Section */}
          <Card>
            <CardHeader>
              <CardTitle>Color Picker</CardTitle>
              <CardDescription>
                Select a color and get its values in different formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center">
                  <HexColorPicker color={color} onChange={setColor} className="!w-full md:!w-64" />
                  <div className="mt-4 flex items-center gap-2">
                    <div 
                      className="h-10 w-10 rounded-md border" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(color)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>HEX</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={color} 
                        onChange={handleColorInputChange}
                        placeholder="#000000"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(color)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>RGB</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`} 
                        readOnly 
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>HSL</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`hsl(${hsla.h}, ${hsla.s}%, ${hsla.l}%)`} 
                        readOnly 
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(`hsl(${hsla.h}, ${hsla.s}%, ${hsla.l}%)`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>CMYK</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`} 
                        readOnly 
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ColorMagic Palette Search */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette Search</CardTitle>
              <CardDescription>
                Search for color palettes from ColorMagic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Try: nature, vintage, pastel, ocean, sunset, forest..."
                  value={paletteQuery}
                  onChange={handleSearchChange}
                />
                <Button 
                  onClick={() => fetchColorPalettes(paletteQuery)}
                  disabled={paletteLoading}
                >
                  {paletteLoading ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                      Searching...
                    </div>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>

              {paletteError && (
                <div className="text-sm text-red-500 p-3 bg-red-500/10 rounded-md">
                  {paletteError}
                </div>
              )}

              {palettes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {palettes.map((palette) => (
                    <div 
                      key={palette.id} 
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 grid grid-cols-5">
                          {palette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="h-20 sm:h-24 relative group"
                              style={{ backgroundColor: color }}
                            >
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="text-xs"
                                  onClick={() => {
                                    navigator.clipboard.writeText(color);
                                    // Could add a toast notification here
                                  }}
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-4 bg-card sm:w-48">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{palette.text}</h4>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {palette.tags.slice(0, 4).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-secondary px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Heart className="h-4 w-4 mr-1" />
                              {palette.likesCount}
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className="h-4 w-4 rounded border"
                                  style={{ backgroundColor: color }}
                                ></div>
                                <span className="text-xs font-mono">{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paletteLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"></div>
                </div>
              ) : paletteQuery ? (
                <div className="text-center py-8 text-muted-foreground">
                  No palettes found. Try a different search term.
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Search for color palettes to get started
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
