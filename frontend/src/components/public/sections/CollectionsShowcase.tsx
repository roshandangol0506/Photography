import { useActiveCollections } from "@/api/collections";
import { TaxonomyGrid } from "./TaxonomyGrid";

export function CollectionsShowcase() {
  const { data } = useActiveCollections();
  return (
    <TaxonomyGrid
      eyebrow="Curated"
      title="Collections"
      items={data ?? []}
      queryParam="collection"
    />
  );
}
