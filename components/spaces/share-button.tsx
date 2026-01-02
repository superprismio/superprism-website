"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Share } from "lucide-react";

type ShareButtonProps = {
  url: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function ShareButton({
  url,
  variant = "ghost",
  size = "sm",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      title={copied ? "Copied!" : "Copy share link"}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share className="h-4 w-4" />}
      <span className="sr-only">Copy share link</span>
    </Button>
  );
}
