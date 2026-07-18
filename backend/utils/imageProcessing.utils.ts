import sharp from "sharp";

export interface ImageVariant {
  buffer: Buffer;
  suffix: "thumb" | "medium" | "large";
  width: number;
}

const VARIANTS: { suffix: "thumb" | "medium" | "large"; width: number }[] = [
  { suffix: "thumb", width: 400 },
  { suffix: "medium", width: 1200 },
  { suffix: "large", width: 2000 },
];

export const generateImageVariants = async (
  buffer: Buffer,
): Promise<ImageVariant[]> => {
  const variants: ImageVariant[] = [];
  for (const variant of VARIANTS) {
    const resized = await sharp(buffer)
      .resize({ width: variant.width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    variants.push({ buffer: resized, suffix: variant.suffix, width: variant.width });
  }
  return variants;
};

export const generateBlurPlaceholder = async (buffer: Buffer): Promise<string> => {
  const tiny = await sharp(buffer)
    .resize({ width: 16 })
    .blur()
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
};
