import Link from "next/link";

type ServiceCardProps = {
  title: string;
  description: string;
  href: string;
  focus: string[];
};

export function ServiceCard({ title, description, href, focus }: ServiceCardProps) {
  return (
    <article className="cq-panel cq-card-hover flex h-full flex-col p-8">
      <div className="mb-6 flex gap-2">
        {focus.map((item) => (
          <span
            key={item}
            className="rounded-full border border-cq-line bg-cq-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cq-brand"
          >
            {item}
          </span>
        ))}
      </div>
      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-cq-navy">{title}</h3>
      <p className="mt-4 flex-1 text-sm leading-7 text-cq-slate">{description}</p>
      <Link href={href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cq-brand hover:text-cq-action">
        Ver más
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
