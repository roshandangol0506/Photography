import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  blurDataURL?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

export function ProgressiveImage({
  src,
  srcSet,
  sizes,
  blurDataURL,
  alt,
  className,
  imgClassName,
  priority,
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full scale-110 object-cover blur-md transition-opacity duration-700",
            loaded ? "opacity-0" : "opacity-100",
          )}
        />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative h-full w-full object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
