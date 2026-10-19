import sharp from "sharp";

export interface ImageVariant {
  buffer: Buffer;
  suffix: "thumb" | "medium" | "large";
  width: number;
}

// `large` is wider than the widest width next/image will ever request (2048),
// so the optimizer always DOWNSCALES. A source narrower than the requested
// width is what makes a photograph look soft - the browser has to scale the
// shortfall back up.
const VARIANTS: { suffix: "thumb" | "medium" | "large"; width: number }[] = [
  { suffix: "thumb", width: 400 },
  { suffix: "medium", width: 1200 },
  { suffix: "large", width: 2560 },
];

// These derivatives are the only copy kept - the original is discarded - and
// next/image re-encodes them a second time downstream. Encoding high here
// keeps that second pass from compounding into visible artefacts.
const WEBP_QUALITY = 92;

export const generateImageVariants = async (
  buffer: Buffer,
): Promise<ImageVariant[]> => {
  const variants: ImageVariant[] = [];
  for (const variant of VARIANTS) {
    const resized = await sharp(buffer)
      .resize({ width: variant.width, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
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
