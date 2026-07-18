import { Link } from "react-router-dom";
import { SectionReveal } from "@/components/public/SectionReveal";

interface TaxonomyItem {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
}

interface TaxonomyGridProps {
  eyebrow: string;
  title: string;
  items: TaxonomyItem[];
  queryParam: "category" | "collection";
}

export function TaxonomyGrid({
  eyebrow,
  title,
  items,
  queryParam,
}: TaxonomyGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionReveal className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      </SectionReveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <SectionReveal key={item._id} delay={i * 0.05}>
            <Link
              to={`/gallery?${queryParam}=${item.slug}`}
              className="group relative flex h-40 items-end overflow-hidden rounded-xl border border-border bg-muted p-4"
            >
              {item.coverImage && (
                <img
                  src={item.coverImage}
                  alt={item.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
              <span className="relative text-lg font-semibold text-white">
                {item.name}
              </span>
            </Link>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
