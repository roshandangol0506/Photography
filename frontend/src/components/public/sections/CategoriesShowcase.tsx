import { useActiveCategories } from "@/api/categories";
import { TaxonomyGrid } from "./TaxonomyGrid";

export function CategoriesShowcase() {
  const { data } = useActiveCategories();
  return (
    <TaxonomyGrid
      eyebrow="Explore"
      title="Categories"
      items={data ?? []}
      queryParam="category"
    />
  );
}
