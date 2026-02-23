'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type AIOutputProps = {
  text: string | null;
  tokensUsed: number;
  estimatedCost: number;
  loading: boolean;
};

export function AIOutput({ text, tokensUsed, estimatedCost, loading }: AIOutputProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Generating...</span>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">AI response will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-3">
        <span className="text-sm font-medium">Output</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
      </ScrollArea>
      {tokensUsed > 0 && (
        <div className="flex gap-2 border-t pt-3 mt-3">
          <Badge variant="secondary" className="text-xs">
            {tokensUsed.toLocaleString()} tokens
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ${estimatedCost.toFixed(4)}
          </Badge>
        </div>
      )}
    </div>
  );
}
