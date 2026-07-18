import { Link } from "react-router-dom";
import { usePublicPhotos } from "@/api/photos";
import { SectionReveal } from "@/components/public/SectionReveal";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet, RECENT_WORKS_SIZES } from "@/lib/image";

export function RecentWorks() {
  const { data } = usePublicPhotos({ perpage: 6 });
  const photos = data?.photos ?? [];

  if (photos.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionReveal className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Latest
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Recent Works
        </h2>
      </SectionReveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <SectionReveal key={photo._id} delay={i * 0.05}>
            <Link
              to={`/gallery?photo=${photo.slug}`}
              className="group block overflow-hidden rounded-xl"
            >
              <ProgressiveImage
                src={photo.images.medium}
                srcSet={photoSrcSet(photo.images)}
                sizes={RECENT_WORKS_SIZES}
                blurDataURL={photo.images.blurDataURL}
                alt={photo.title}
                className="aspect-4/3"
                imgClassName="transition-transform duration-500 group-hover:scale-110"
              />
              <p className="mt-3 text-sm font-medium text-foreground">
                {photo.title}
              </p>
            </Link>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
