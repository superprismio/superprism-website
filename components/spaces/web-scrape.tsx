"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { useSpaceFiles } from "@/hooks/useSpaceFiles";
import { PrismLoader } from "../shared/prism-loader";

type WebScrapeProps = {
  heapId: string;
  onClose: () => void;
  onSuccess: (markdown: string) => void;
};

export function WebScrape({ heapId, onClose, onSuccess }: WebScrapeProps) {
  const { scrapeWeb, isScrapingWeb } = useSpaceFiles(heapId);
  const [webScrapeUrl, setWebScrapeUrl] = useState<string>("");
  const [webScrapeError, setWebScrapeError] = useState<string | null>(null);

  const handleScrapeWeb = async () => {
    if (!webScrapeUrl.trim()) {
      setWebScrapeError("Please enter a URL");
      return;
    }

    setWebScrapeError(null);

    try {
      const markdown = await scrapeWeb(webScrapeUrl.trim());
      // Call success callback with markdown
      onSuccess(markdown);
      setWebScrapeUrl("");
    } catch (err) {
      setWebScrapeError(err instanceof Error ? err.message : "Failed to scrape URL");
    }
  };

  return (
    <div className="holographic-shimmer h-full relative">
      {isScrapingWeb && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <PrismLoader size={96} className="text-primary" />
          </div>
        </div>
      )}
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-foreground">
            Scrape Web URL
          </h4>
          <p className="text-sm text-muted-foreground">
            Enter a URL to scrape and convert to markdown.
          </p>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="https://example.com/article"
          value={webScrapeUrl}
          onChange={(event) => {
            setWebScrapeUrl(event.target.value);
            setWebScrapeError(null);
          }}
          disabled={isScrapingWeb}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isScrapingWeb) {
              handleScrapeWeb();
            }
          }}
        />
      </div>

      {webScrapeError && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
          {webScrapeError}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button
          onClick={handleScrapeWeb}
          disabled={isScrapingWeb || !webScrapeUrl.trim()}
          className="flex-1"
        >
          {isScrapingWeb ? "Scraping..." : "Scrape"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setWebScrapeUrl("");
            setWebScrapeError(null);
          }}
          disabled={isScrapingWeb}
        >
          Clear
        </Button>
      </div>
      </div>
    </div>
  );
}

