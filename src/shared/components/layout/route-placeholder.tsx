import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { PageContainer } from "./page-container";

export function RoutePlaceholder({
  title,
  section,
  description,
}: {
  readonly title: string;
  readonly section: string;
  readonly description: string;
}) {
  return (
    <PageContainer className="max-w-2xl">
      <Link
        href="/dashboard"
        className="focus-ring text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded px-1 py-1 text-sm"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>
      <section className="bg-card mt-8 rounded-2xl border p-7 md:p-9">
        <div className="bg-secondary text-primary grid size-11 place-items-center rounded-xl">
          <Construction size={22} />
        </div>
        <p className="text-primary mt-6 text-sm font-medium">
          {section} · Planned screen
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          {description}
        </p>
        <p className="bg-muted text-muted-foreground mt-6 rounded-lg px-4 py-3 text-sm">
          This route is available as a scaffold. Feature behavior will be added
          in a future phase.
        </p>
      </section>
    </PageContainer>
  );
}
