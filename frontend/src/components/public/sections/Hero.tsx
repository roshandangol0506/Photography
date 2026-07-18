import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useBackgroundPhotos } from "@/api/photos";
import { useTheme } from "@/hooks/useTheme";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";
import { cn } from "@/lib/utils";

export function Hero() {
  const { settings } = useTheme();
  const { data: photos } = useBackgroundPhotos();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!photos || photos.length < 2) return;
    const speed = settings.heroSettings?.autoplaySpeedMs || 5000;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, speed);
    return () => clearInterval(timer);
  }, [photos, settings.heroSettings]);

  return (
    <section className="relative -mt-24 flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden bg-black">
      {photos && photos.length > 0 ? (
        photos.map((photo, i) => (
          <div
            key={photo._id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <ProgressiveImage
              src={photo.images.large}
              srcSet={photoSrcSet(photo.images)}
              sizes="100vw"
              blurDataURL={photo.images.blurDataURL}
              alt={photo.title}
              className="h-full w-full"
              priority={i === 0}
            />
          </div>
        ))
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />
      )}

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm font-medium uppercase tracking-[0.3em] text-white/80"
        >
          {settings.tagline || "Photography Portfolio"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl"
        >
          {settings.siteTitle}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Link
            to="/gallery"
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            Explore the Gallery
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/70">
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}
