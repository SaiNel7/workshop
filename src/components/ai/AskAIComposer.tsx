"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AskAIMode } from "@/lib/ai/schema";

interface AskAIComposerProps {
  onSend: (prompt: string, mode: AskAIMode) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function AskAIComposer({
  onSend,
  onCancel,
  autoFocus = true,
  disabled = false,
}: AskAIComposerProps) {
  const [mode, setMode] = useState<AskAIMode>("critique");
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || disabled) return;

    onSend(trimmedPrompt, mode);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Cancel on Escape
    if (e.key === "Escape" && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-muted/30 rounded-lg border border-border">
      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("critique")}
          disabled={disabled}
          className={cn(
            "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            mode === "critique"
              ? "bg-foreground text-background"
              : "bg-background text-foreground hover:bg-muted"
          )}
        >
          Critique
        </button>
        <button
          type="button"
          onClick={() => setMode("synthesize")}
          disabled={disabled}
          className={cn(
            "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            mode === "synthesize"
              ? "bg-foreground text-background"
              : "bg-background text-foreground hover:bg-muted"
          )}
        >
          Synthesize
        </button>
      </div>

      {/* Prompt input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            mode === "critique"
              ? "Ask for feedback... (e.g., 'Is this clear?')"
              : "Ask for a rewrite... (e.g., 'Make this more concise')"
          }
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            <Sparkles className="inline w-3 h-3 mr-1" />
            Enter to send, Shift+Enter for new line
          </span>
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={disabled}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!prompt.trim() || disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
