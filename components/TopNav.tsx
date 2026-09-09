"use client";

type TopNavProps = {
  tripTitle: string;
  origin: string;
  destination: string;
  dateRange: string;
  days: number;
};

const sections = [
  { id: "flights", label: "航班" },
  { id: "route", label: "路线" },
  { id: "itinerary", label: "行程" },
  { id: "todo", label: "待办" },
  { id: "manage", label: "管理" },
];

export function TopNav({ tripTitle, origin, destination, dateRange, days }: TopNavProps) {
  const onScrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[color:var(--color-surface)/0.88] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-3 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">🎀 凯蒂风旅行手账</p>
            <h1 className="text-xl font-semibold text-[var(--color-text)] md:text-2xl">{tripTitle}</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {origin} → {destination}
            </p>
          </div>

          <div className="text-right text-xs text-[var(--color-text-secondary)] md:text-sm">
            <p>{dateRange}</p>
            <p className="mt-1 font-semibold tracking-wide text-[var(--color-primary)]">{days} 天</p>
          </div>
        </div>

        <nav className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="页面分区导航">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onScrollTo(section.id)}
              className="min-h-11 min-w-[92px] rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
