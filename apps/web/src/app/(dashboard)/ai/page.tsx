"use client";

import { useState } from "react";
import { trpc } from "@x4/shared/api-client";
import { toast } from "sonner";
import { Sparkles, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AIOutput } from "@/components/ai-output";

export default function AIPlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState("1024");
  const [systemOpen, setSystemOpen] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    tokensUsed: number;
    estimatedCost: number;
  } | null>(null);

  const generateMutation = trpc.ai.generate.useMutation({
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    generateMutation.mutate({
      prompt: prompt.trim(),
      systemPrompt: systemPrompt.trim() || undefined,
      maxTokens: parseInt(maxTokens),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Playground</h1>
        <p className="text-muted-foreground">
          Generate text with Claude AI. Experiment with prompts and settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input</CardTitle>
            <CardDescription>Configure and send your prompt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between px-0"
                >
                  <span className="text-sm font-medium">System Prompt</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${systemOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Textarea
                  placeholder="You are a helpful assistant..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                placeholder="Ask me anything..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            <div className="flex items-end gap-3">
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Select value={maxTokens} onValueChange={setMaxTokens}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256</SelectItem>
                    <SelectItem value="512">512</SelectItem>
                    <SelectItem value="1024">1024</SelectItem>
                    <SelectItem value="2048">2048</SelectItem>
                    <SelectItem value="4096">4096</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !prompt.trim()}
                className="flex-1"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {generateMutation.isPending ? "Generating..." : "Generate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Output</CardTitle>
            <CardDescription>AI-generated response</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <AIOutput
              text={result?.text ?? null}
              tokensUsed={result?.tokensUsed ?? 0}
              estimatedCost={result?.estimatedCost ?? 0}
              loading={generateMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
