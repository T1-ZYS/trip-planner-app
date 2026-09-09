type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="mb-5 md:mb-6">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">{eyebrow}</p> : null}
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p> : null}
    </div>
  );
}
