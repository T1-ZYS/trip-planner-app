export function parseFlightTime(value?: string, fallbackYear?: number): number | null {
  if (!value) return null;

  const isoLike = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
  if (isoLike) {
    const year = Number(isoLike[1]);
    const month = Number(isoLike[2]);
    const day = Number(isoLike[3]);
    const hour = isoLike[4] ? Number(isoLike[4]) : 0;
    const minute = isoLike[5] ? Number(isoLike[5]) : 0;
    return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
  }

  return parseChineseFlightTime(value, fallbackYear);
}

export function parseChineseFlightTime(value: string, fallbackYear?: number): number | null {
  if (!value) return null;

  const match = value.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const hour = match[3] ? Number(match[3]) : 0;
  const minute = match[4] ? Number(match[4]) : 0;

  const now = new Date();
  const year = fallbackYear ?? now.getFullYear();
  const target = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (target.getTime() < now.getTime() && fallbackYear === undefined) {
    target.setFullYear(year + 1);
  }

  return target.getTime();
}

export function formatCountdown(target: number | null): {
  expired: boolean;
  parts: { label: string; value: string }[];
} {
  if (target === null) {
    return {
      expired: true,
      parts: [
        { label: "天", value: "--" },
        { label: "小时", value: "--" },
        { label: "分钟", value: "--" },
        { label: "秒", value: "--" },
      ],
    };
  }

  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      expired: true,
      parts: [
        { label: "天", value: "00" },
        { label: "小时", value: "00" },
        { label: "分钟", value: "00" },
        { label: "秒", value: "00" },
      ],
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  return {
    expired: false,
    parts: [
      { label: "天", value: pad(days) },
      { label: "小时", value: pad(hours) },
      { label: "分钟", value: pad(minutes) },
      { label: "秒", value: pad(seconds) },
    ],
  };
}
