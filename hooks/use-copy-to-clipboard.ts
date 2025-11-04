import { useState } from "react";
import toast from "react-hot-toast";

interface CopyOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (
    text: string,
    options?: CopyOptions
  ): Promise<boolean> => {
    if (!navigator?.clipboard) {
      toast.error(options?.errorMessage || "Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      // toast.success(options?.successMessage || "Copied to clipboard!", {
      //   icon: "📋",
      // });
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error(options?.errorMessage || "Failed to copy to clipboard");
      setCopiedText(null);
      return false;
    }
  };

  return { copiedText, copyToClipboard };
}
