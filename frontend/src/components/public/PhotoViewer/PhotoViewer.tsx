import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent, WheelEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { usePhotoBySlug } from "@/api/photos";
import { LikeButton } from "@/components/public/LikeButton";
import { ShareButton } from "@/components/public/ShareButton";
import { PhotoDrawer } from "./PhotoDrawer";
import { cn } from "@/lib/utils";

interface PhotoViewerProps {
  slug: string;
  slugList: string[];
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

export function PhotoViewer({
  slug,
  slugList,
  onClose,
  onNavigate,
}: PhotoViewerProps) {
  const { data, isLoading } = usePhotoBySlug(slug);
  const [zoomed, setZoomed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const currentIndex = slugList.indexOf(slug);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < slugList.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(slugList[currentIndex - 1]);
    setZoomed(false);
  }, [hasPrev, slugList, currentIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(slugList[currentIndex + 1]);
    setZoomed(false);
  }, [hasNext, slugList, currentIndex, onNavigate]);

  const handleClose = useCallback(() => setVisible(false), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose, goPrev, goNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) goPrev();
      else goNext();
      return;
    }
    if (Math.abs(dy) > 60) {
      setDrawerOpen(dy < 0);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.deltaY > 30 && !drawerOpen) setDrawerOpen(true);
  };

  return createPortal(
    <motion.div
      data-testid="photo-viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      onAnimationComplete={() => {
        if (!visible) onClose();
      }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <button
        onClick={handleClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <X className="h-5 w-5" />
      </button>

      {hasPrev && (
        <button
          onClick={goPrev}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:block"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={goNext}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:block"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {isLoading || !data ? (
          <p className="text-white/70">Loading...</p>
        ) : (
          <img
            src={data.photo.images.large}
            alt={data.photo.title}
            onClick={() => setZoomed((z) => !z)}
            className={cn(
              "max-h-full max-w-full cursor-zoom-in object-contain transition-transform duration-300",
              zoomed && "max-w-none max-h-none scale-150 cursor-zoom-out",
            )}
          />
        )}
      </div>

      {data && (
        <div className="flex items-center justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-white sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {data.photo.title}
            </p>
            {data.photo.category && (
              <p className="text-xs text-white/70">
                {data.photo.category.name}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <LikeButton
              photoId={data.photo._id}
              likeCount={data.photo.likeCount}
            />
            <ShareButton title={data.photo.title} />
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Show details"
              className="flex items-center gap-1 text-sm text-white/90 hover:text-white"
            >
              <ChevronUp className="h-4 w-4" /> Details
            </button>
          </div>
        </div>
      )}

      <PhotoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        photo={data?.photo}
        related={data?.related ?? []}
        onSelectRelated={(relatedSlug) => {
          setDrawerOpen(false);
          onNavigate(relatedSlug);
        }}
      />
    </motion.div>,
    document.body,
  );
}
