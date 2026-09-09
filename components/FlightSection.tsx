import type { Flight } from "@/types/trip";
import { SectionTitle } from "@/components/SectionTitle";
import { FlightCountdown } from "@/components/FlightCountdown";

type FlightSectionProps = {
  flights: Flight[];
};

function FlightCard({ flight, index, total }: { flight: Flight; index: number; total: number }) {
  return (
    <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] md:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
        航班 {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div>
          <p className="text-xs text-[var(--color-text-secondary)]">出发</p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{flight.departureTime}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{flight.departureAirport}</p>
        </div>

        <div className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-primary)]">✈ {flight.duration}</div>

        <div className="md:text-right">
          <p className="text-xs text-[var(--color-text-secondary)]">到达</p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{flight.arrivalTime}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{flight.arrivalAirport}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-[var(--color-text-secondary)] md:grid-cols-2">
        <p><span className="text-[var(--color-text)]">{flight.airline}</span> · {flight.flightNumber}</p>
        <p>航站楼：{flight.terminal}</p>
        <p>座位：{flight.seat}</p>
        <p>行李：{flight.baggage}</p>
      </div>

      <div className="mt-3 rounded-xl bg-[var(--color-soft)] px-3 py-2 text-sm">
        <FlightCountdown target={flight.departureAt} fallbackTarget={flight.departureTime} className="text-sm" />
      </div>

      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{flight.notes}</p>
    </article>
  );
}

export function FlightSection({ flights }: FlightSectionProps) {
  return (
    <section id="flights" className="scroll-mt-40">
      <SectionTitle
        eyebrow="登机信息"
        title="航班"
        description="高级登机牌式信息卡，集中管理去程、转场与返程航班。每段航班都带有实时倒计时。"
      />

      <div className="grid gap-4 md:gap-5">
        {flights.map((flight, index) => (
          <FlightCard key={flight.id} flight={flight} index={index} total={flights.length} />
        ))}
      </div>
    </section>
  );
}
