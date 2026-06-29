type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
};

export function SectionHeading({ eyebrow, title, description, center = false }: SectionHeadingProps) {
  return (
    <div className={`space-y-4 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      <p className="cq-overline">{eyebrow}</p>
      <h2 className="cq-section-title">{title}</h2>
      <p className="cq-copy">{description}</p>
    </div>
  );
}
