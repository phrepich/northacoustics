type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="cq-section pt-10">
      <div className="cq-shell">
        <div className="cq-panel overflow-hidden">
          <div className="cq-gridline relative overflow-hidden bg-[linear-gradient(135deg,#0f1318_0%,#123b43_65%,#1a4a54_100%)] px-8 py-14 text-white md:px-12 md:py-18">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,138,87,0.18),transparent_28%),linear-gradient(90deg,rgba(15,19,24,0.64),rgba(15,19,24,0.28))]" />
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cq-copper/10 blur-3xl" />
            <div className="relative max-w-4xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/62">{eyebrow}</p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] md:text-6xl">{title}</h1>
              <p className="max-w-2xl text-base leading-8 text-white/72 md:text-lg">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
