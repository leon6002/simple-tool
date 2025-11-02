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
  FileText,
  Binary,
  Hash,
  Link2,
  Code,
  Type,
  Sparkles,
} from "lucide-react";

export default function TextUtilsPage() {
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
            <FileText className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Text Utilities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Base64 encoding/decoding, hash generation, and more
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
            <p className="font-medium">The Text Utilities will support:</p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Binary className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Base64 encode and decode</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Hash className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Generate MD5, SHA-1, SHA-256 hashes</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Link2 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>URL encode and decode</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Code className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>JSON formatter and validator</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Type className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Text case converter (upper, lower, title)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
