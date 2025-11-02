"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  MonitorCog,
} from "lucide-react";

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const {
    animations,
    setAnimations,
    searchHistory,
    clearSearchHistory,
    removeFromSearchHistory,
  } = useUserPreferencesStore();

  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const handleClearHistory = () => {
    setIsClearingHistory(true);
    clearSearchHistory();
    setTimeout(() => setIsClearingHistory(false), 1000);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
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
            <Palette className="h-8 w-8 text-purple-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Preferences
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Customize your SimpleTool experience
          </p>
        </div>

        <div className="grid gap-8">
          {/* Theme Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Theme Preferences
                </CardTitle>
                <CardDescription>
                  Choose how SimpleTool looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred color scheme
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="gap-2"
                    >
                      <MonitorCog className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable UI animations
                    </p>
                  </div>
                  <Switch
                    checked={animations}
                    onCheckedChange={setAnimations}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Search History
                  </span>
                  {searchHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearHistory}
                      disabled={isClearingHistory}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isClearingHistory ? "Cleared!" : "Clear All"}
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>Your recent search queries</CardDescription>
              </CardHeader>
              <CardContent>
                {searchHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((query, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-2 text-sm flex items-center gap-2 group"
                      >
                        {query}
                        <button
                          onClick={() => removeFromSearchHistory(query)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No search history yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tablet className="h-5 w-5" />
                  Device Information
                </CardTitle>
                <CardDescription>
                  Technical details about your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Agent</span>
                  <span className="text-sm font-mono max-w-[60%] truncate">
                    {navigator.userAgent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Screen Size</span>
                  <span>
                    {typeof window !== "undefined"
                      ? `${window.screen.width} × ${window.screen.height}`
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color Depth</span>
                  <span>
                    {typeof window !== "undefined"
                      ? window.screen.colorDepth
                      : "Unknown"}{" "}
                    bit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Preferred Languages
                  </span>
                  <span>
                    {typeof navigator !== "undefined"
                      ? navigator.languages.join(", ")
                      : "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
