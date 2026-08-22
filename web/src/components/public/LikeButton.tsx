"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useVisitorId } from "@/hooks/useVisitorId";
import { useLikeStatus, useLikePhoto, useUnlikePhoto } from "@/lib/api/likes";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  photoId: string;
  likeCount: number;
  size?: "sm" | "md";
  className?: string;
}

export function LikeButton({
  photoId,
  likeCount,
  size = "md",
  className,
}: LikeButtonProps) {
  const visitorId = useVisitorId();
  const { data: status } = useLikeStatus(photoId, visitorId);
  const likeMutation = useLikePhoto();
  const unlikeMutation = useUnlikePhoto();

  const liked = status?.liked ?? false;
  const isPending = likeMutation.isPending || unlikeMutation.isPending;

  // The frame around this is usually a link, so the click must not bubble.
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!visitorId || isPending) return;
    const mutation = liked ? unlikeMutation : likeMutation;
    mutation.mutate({ photoId, visitorId });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!visitorId || isPending}
      className={cn(
        "flex items-center gap-1.5 transition-colors disabled:opacity-60",
        size === "sm" ? "text-xs" : "text-sm",
        liked ? "text-red-500" : "text-current hover:text-red-500",
        className,
      )}
      aria-label={liked ? "Unlike photo" : "Like photo"}
      aria-pressed={liked}
    >
      <motion.span
        key={liked ? "liked" : "unliked"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <Heart
          className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
          fill={liked ? "currentColor" : "none"}
        />
      </motion.span>
      <span>{likeCount}</span>
    </button>
  );
}
