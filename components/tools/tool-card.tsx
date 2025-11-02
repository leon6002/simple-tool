"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolCardProps } from "@/types";
import { ArrowRight, Sparkles, LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export function ToolCard({ tool }: ToolCardProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[tool.icon] as LucideIcon;

  return (
    <Link href={tool.href} className="group">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="h-full cursor-pointer overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 group-hover:bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                {IconComponent && (
                  <IconComponent className="h-7 w-7 text-purple-600" />
                )}
              </div>
              {tool.featured && (
                <Badge className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                {tool.name}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {tool.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700 transition-colors">
              <span>Explore tool</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
