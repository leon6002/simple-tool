// IconMap.ts or similar file
import {
  Zap,
  Loader2,
  GitBranch,
  // ... import all icons you might receive from your API
  type LucideIcon,
} from "lucide-react";

import { siDocker, siLinux, siNginx, type SimpleIcon } from "simple-icons";

// Define a mapping object where keys are strings and values are components
export const LucideIconMap: Record<string, LucideIcon> = {
  Zap,
  Loader2,
  GitBranch,
  // ... add all other icons
};

export const SimpleIconMap: Record<string, SimpleIcon> = {
  siDocker,
  siLinux,
  siNginx,
};
// Also define a type for your specific icon names for better type safety
export type LucideIconName = keyof typeof LucideIconMap;
export type SimpleIconName = keyof typeof SimpleIconMap;
