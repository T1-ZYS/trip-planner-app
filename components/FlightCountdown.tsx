"use client";

import { useEffect, useState } from "react";

type FlightCountdownProps = {
  target?: string;
  fallbackTarget?: string;
  className?: string;
};

function parseTarget(target: string | undefined, fallback: string | undefined): number | null {
  if (target) {
    const iso = target.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
    if (iso) {
      return new Date(
        Number(iso[1]),
        Number(iso[2]) - 1,
        Number(iso[3]),
        Number(iso[4] ?? "0"),
        Number(iso[5] ?? "0"),
        0,
        0,
      ).getTime();
    }
  }

  if (fallback) {
    const match = fallback.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日(?:\s+(\d{1,2}):(\d{2}))?/);
    if (match) {
      const now = new Date();
      return new Date(now.getFullYear(), Number(match[1]) - 1, Number(match[2]), Number(match[3] ?? "0"), Number(match[4] ?? "0"), 0, 0).getTime();
    }
  }

  return null;
}

function formatRemaining(targetMs: number | null): string {
  if (targetMs === null) return "--天 --:--:--";
  const diff = targetMs - Date.now();
  if (diff <= 0) return "已起飞";
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${days}天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function FlightCountdown({ target, fallbackTarget, className }: FlightCountdownProps) {
  const initialText = parseTarget(target, fallbackTarget) === null ? "时间待定" : "加载中…";
  const [text, setText] = useState<string>(initialText);

  useEffect(() => {
    const targetMs = parseTarget(target, fallbackTarget);
    if (targetMs === null) {
      return undefined;
    }

    const update = () => setText(formatRemaining(targetMs));
    update();

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [target, fallbackTarget]);

  return (
    <p className={className} suppressHydrationWarning>
      <span className="text-[var(--color-text-secondary)]">距离起飞 </span>
      <span className="font-mono font-semibold text-[var(--color-text)]">{text}</span>
    </p>
  );
}
