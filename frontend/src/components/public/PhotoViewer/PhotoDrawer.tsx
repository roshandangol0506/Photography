import { AnimatePresence, motion } from "framer-motion";
import { Camera, Calendar, MapPin, Tag as TagIcon, X } from "lucide-react";
import type { Photo, RelatedPhoto } from "@/api/photos";
import { CommentSection } from "./CommentSection";

interface PhotoDrawerProps {
  open: boolean;
  onClose: () => void;
  photo?: Photo;
  related: RelatedPhoto[];
  onSelectRelated: (slug: string) => void;
}

export function PhotoDrawer({
  open,
  onClose,
  photo,
  related,
  onSelectRelated,
}: PhotoDrawerProps) {
  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 top-16 z-30 flex flex-col overflow-hidden rounded-t-3xl bg-background text-foreground sm:top-24"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">{photo.title}</h2>
            <button
              onClick={onClose}
              aria-label="Close details"
              className="rounded-full p-1.5 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            {photo.description && (
              <p className="text-muted-foreground">{photo.description}</p>
            )}

            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {photo.camera && (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Camera className="h-3.5 w-3.5" /> Camera
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {photo.camera}
                  </dd>
                </div>
              )}
              {photo.lens && (
                <div>
                  <dt className="text-muted-foreground">Lens</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {photo.lens}
                  </dd>
                </div>
              )}
              {photo.location && (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {photo.location}
                  </dd>
                </div>
              )}
              {photo.dateTaken && (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {new Date(photo.dateTaken).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {photo.category && (
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {photo.category.name}
                  </dd>
                </div>
              )}
            </dl>

            {photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                  >
                    <TagIcon className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {related.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Related Photos
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {related.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => onSelectRelated(item.slug)}
                      className="h-24 w-32 shrink-0 overflow-hidden rounded-lg"
                    >
                      <img
                        src={item.images.thumb}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <CommentSection photoId={photo._id} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
