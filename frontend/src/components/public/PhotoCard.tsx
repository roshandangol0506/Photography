import { MessageCircle, Eye } from "lucide-react";
import { LikeButton } from "@/components/public/LikeButton";
import { photoSrcSet, GRID_SIZES } from "@/lib/image";
import type { Photo } from "@/api/photos";

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${photo.title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group relative mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl bg-cover bg-center text-left"
      style={{ backgroundImage: `url(${photo.images.blurDataURL})` }}
    >
      <img
        src={photo.images.medium}
        srcSet={photoSrcSet(photo.images)}
        sizes={GRID_SIZES}
        alt={photo.title}
        loading="lazy"
        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="truncate text-sm font-semibold text-white">
          {photo.title}
        </p>
        <div className="mt-2 flex items-center gap-4 text-white/90">
          <LikeButton
            photoId={photo._id}
            likeCount={photo.likeCount}
            size="sm"
          />
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="h-3.5 w-3.5" /> {photo.commentCount}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Eye className="h-3.5 w-3.5" /> {photo.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}
