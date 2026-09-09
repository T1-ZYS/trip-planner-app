import type { BasicInfo } from "@/types/trip";

type HeroSectionProps = {
  basicInfo: BasicInfo;
};

export function HeroSection({ basicInfo }: HeroSectionProps) {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-soft)] via-[var(--color-surface)] to-[var(--color-surface)] p-6 shadow-[0_10px_30px_rgba(229,57,79,0.06)] md:p-10">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            🎀 凯蒂风旅行手账
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--color-text)] md:text-6xl">{basicInfo.title}</h2>
          <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)] md:max-w-2xl">{basicInfo.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-text)] md:text-base">
            <span>{basicInfo.origin}</span>
            <span className="text-[var(--color-primary)]">→</span>
            <span>{basicInfo.destination}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">旅行日期</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{basicInfo.startDate} — {basicInfo.endDate}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">行程时长</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-primary)]">{basicInfo.days} 天</p>
        </div>
      </div>
    </section>
  );
}
