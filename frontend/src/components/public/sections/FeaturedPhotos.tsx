import { Link } from "react-router-dom";
import { usePublicPhotos } from "@/api/photos";
import { SectionReveal } from "@/components/public/SectionReveal";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";

export function FeaturedPhotos() {
  const { data } = usePublicPhotos({ featured: true, perpage: 8 });
  const photos = data?.photos ?? [];

  if (photos.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionReveal className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Featured
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Featured Photos
        </h2>
      </SectionReveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <SectionReveal key={photo._id} delay={i * 0.05}>
            <Link
              to={`/gallery?photo=${photo.slug}`}
              className="group block overflow-hidden rounded-xl"
            >
              <ProgressiveImage
                src={photo.images.medium}
                blurDataURL={photo.images.blurDataURL}
                alt={photo.title}
                className="aspect-square"
                imgClassName="transition-transform duration-500 group-hover:scale-110"
              />
            </Link>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
