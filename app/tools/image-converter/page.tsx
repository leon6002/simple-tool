"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image,
  FileImage,
  Zap,
  Download,
  Sparkles,
  Settings,
} from "lucide-react";

export default function ImageConverterPage() {
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
            <Image className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Image Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Convert images between JPG, PNG, WebP, and other formats
          </p>
          <Badge className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30">
            Coming Soon
          </Badge>
        </div>

        <Card className="border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" /> Feature Preview
            </CardTitle>
            <CardDescription>
              This tool is currently under development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">The Image Converter will support:</p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <FileImage className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Convert between JPG, PNG, WebP, GIF, and BMP formats
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Zap className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Batch conversion of multiple images</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Settings className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Image quality and compression settings</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Image className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Resize images while converting</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Download className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Client-side processing for privacy</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
