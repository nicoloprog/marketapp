import { Boxes, ShieldCheck, Clock, Users } from "lucide-react";

const stats = [
  { icon: Boxes, value: "1 000 000+", label: "de produits" },
  { icon: ShieldCheck, value: "6", label: "Principaux manufacturiers" },
];

export function StatsSection() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <stat.icon className="h-6 w-6 text-primary" />
              <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
