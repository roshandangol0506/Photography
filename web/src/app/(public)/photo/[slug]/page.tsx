import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MessageCircle } from "lucide-react";
import { getPhotoBySlug, getSettings } from "@/lib/content";
import { LikeButton } from "@/components/public/LikeButton";
import { PhotoComments } from "@/components/public/PhotoComments";
import { PhotoImage } from "@/components/public/PhotoImage";
import { PhotoFrame } from "@/components/public/PhotoFrame";

const LABEL_CLASS = "m-0 text-[10px] tracking-[0.2em] text-md-600 uppercase";
const VALUE_CLASS = "mt-1.5 mb-0 text-[14px]";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Alt text built from whatever the record actually knows, rather than a
 * generic "photo". Title carries the subject; location and series add the
 * context a screen reader or an image search needs.
 */
function altText(photo: {
  title: string;
  location?: string;
  category?: { name: string } | null;
}) {
  const context = [photo.location, photo.category?.name]
    .filter(Boolean)
    .join(", ");
  return context ? `${photo.title} — ${context}` : photo.title;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className={LABEL_CLASS}>{label}</p>
      <p className={VALUE_CLASS}>{value}</p>
    </div>
  );
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [data, settings] = await Promise.all([
    getPhotoBySlug(slug),
    getSettings(),
  ]);

  if (!data?.photo) return { title: "Photograph not found" };

  const { photo } = data;
  const site = settings?.siteTitle ?? "Photography";
  const place = [photo.location, photo.category?.name]
    .filter(Boolean)
    .join(", ");

  // Every field comes from the record, so no two photo pages share a title or
  // description.
  const title = place ? `${photo.title} — ${place}` : photo.title;
  const description =
    photo.description ||
    `${photo.title}${place ? ` photographed in ${place}` : ""}, by ${site}.`;

  return {
    title,
    description,
    alternates: { canonical: `/photo/${photo.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/photo/${photo.slug}`,
      // The large derivative, never an original - none is stored.
      images: [{ url: photo.images.large, alt: altText(photo) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [photo.images.large],
    },
  };
}

export default async function PhotoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [data, settings] = await Promise.all([
    getPhotoBySlug(slug),
    getSettings(),
  ]);

  if (!data?.photo) notFound();

  const { photo, related } = data;
  const alt = altText(photo);

  // Structured data so search engines can read the photograph as a work with
  // an author and a date, rather than guessing from markup.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Photograph",
    name: photo.title,
    description: photo.description || undefined,
    contentUrl: photo.images.large,
    thumbnailUrl: photo.images.thumb,
    dateCreated: photo.dateTaken || undefined,
    contentLocation: photo.location || undefined,
    creator: { "@type": "Person", name: settings?.siteTitle },
  };

  return (
    <div className="modernist min-h-screen text-md-fg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PhotoFrame className="flex justify-center px-9 py-10 max-[900px]:px-4 max-[900px]:py-5">
        <PhotoImage
          images={photo.images}
          variant="large"
          alt={alt}
          sizes="100vw"
          width={2000}
          height={1333}
          priority
          className="h-auto max-w-full"
        />
      </PhotoFrame>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-16 px-9 py-[70px] max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[900px]:px-5 max-[900px]:py-10">
        <div>
          {photo.category?.name && (
            <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
              {photo.category.name}
            </span>
          )}
          <h1 className="mt-[14px] mb-0 font-bold tracking-[-0.025em] text-[clamp(30px,4.4vw,62px)] leading-none">
            {photo.title}
          </h1>

          {photo.description && (
            <p className="mt-7 mb-0 max-w-[560px] text-[15px] leading-[1.75] text-md-700">
              {photo.description}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-7 border-t-2 border-md-divider pt-6">
            <LikeButton
              photoId={photo._id}
              likeCount={photo.likeCount}
              className="text-[13px] tracking-[0.14em] uppercase"
            />
            <span className="inline-flex items-center gap-2 text-[13px] tracking-[0.14em] text-md-600 uppercase">
              <MessageCircle className="h-4 w-4" /> {photo.commentCount}
            </span>
            <span className="inline-flex items-center gap-2 text-[13px] tracking-[0.14em] text-md-600 uppercase">
              <Eye className="h-4 w-4" /> {photo.viewCount} views
            </span>
          </div>

          {photo.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-2 border-md-divider px-3 py-1.5 text-[10px] tracking-[0.16em] text-md-700 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-7 border-t-2 border-md-divider pt-6">
          <Detail label="Location" value={photo.location} />
          <Detail label="Taken" value={formatDate(photo.dateTaken)} />
          <Detail label="Camera" value={photo.camera} />
          <Detail label="Lens" value={photo.lens} />
          <Detail label="Series" value={photo.category?.name} />
          <Detail
            label="Collections"
            value={
              photo.collections.length > 0
                ? photo.collections.map((item) => item.name).join(", ")
                : undefined
            }
          />
        </div>
      </div>

      <PhotoComments photoId={photo._id} />

      {related.length > 0 && (
        <div className="px-9 py-[70px] max-[900px]:px-5 max-[900px]:py-10">
          <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
            More from this series
          </span>
          <div className="mt-9 grid grid-cols-4 gap-9 max-[900px]:grid-cols-2 max-[900px]:gap-4">
            {related.slice(0, 4).map((item) => (
              <Link
                key={item._id}
                href={`/photo/${item.slug}`}
                className="md-photo block overflow-hidden"
              >
                <PhotoFrame className="aspect-[3/4] overflow-hidden">
                  <PhotoImage
                    images={item.images}
                    alt={item.title}
                    sizes="(max-width: 900px) 50vw, 25vw"
                    fill
                    className="object-cover"
                  />
                </PhotoFrame>
                <p className="mt-3 mb-0 text-[11px] tracking-[0.08em] uppercase">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
