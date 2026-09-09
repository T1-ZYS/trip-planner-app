type MapPlaceholderProps = {
  day: number;
};

export function MapPlaceholder({ day }: MapPlaceholderProps) {
  return (
    <div className="sticky top-28 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-[var(--color-text)]">交互地图</h4>
        <span className="rounded-full bg-[var(--color-soft)] px-3 py-1 text-xs text-[var(--color-primary)]">第 {String(day).padStart(2, "0")} 天</span>
      </div>

      <div className="grid h-[360px] place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] text-center">
        <div>
          <p className="text-base font-medium text-[var(--color-text)]">需要配置地图 API Key</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--color-text-secondary)]">
            当前为开发占位地图。下一阶段将接入 Google Maps，并实现标记点、路线与行程联动。
          </p>
        </div>
      </div>
    </div>
  );
}
