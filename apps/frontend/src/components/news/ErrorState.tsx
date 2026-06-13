"use client";

import { RefreshCw } from "lucide-react";
import { memo } from "react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export const ErrorState = memo(function ErrorState({
  title = "Unable to load news",
  message = "Something interrupted the newsroom feed. Please try again.",
  actionLabel = "Retry",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="gradient-container mx-auto flex min-h-[420px] w-full max-w-2xl flex-col items-center justify-center p-1 text-center">
      <div className="gradient-overlay" />
      <div className="relative flex min-h-[412px] w-full flex-col items-center justify-center rounded-[calc(var(--radius-xl)-4px)] border border-white/50 bg-card p-8 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          AWS Community Newsroom
        </p>
        <p className="mt-4 font-display text-3xl font-semibold tracking-tight">
          {title}
        </p>
        <p className="mt-4 max-w-md text-base leading-7 text-muted">
          {message}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-white/75 px-5 py-3 text-sm font-semibold text-foreground [box-shadow:var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-foreground/15"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
});
