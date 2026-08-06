import { imageSrcSet } from "~/utils/images";
import { ImagePlaceholder, specRatio, type ImageSpecKey } from "./ImagePlaceholder";

interface ResponsiveImageProps {
  src: string | null | undefined;
  alt: string;
  /** Пока материала нет — на его месте показывается плейсхолдер с нужным размером. */
  spec: ImageSpecKey;
  sizes?: string;
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
  compactPlaceholder?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  spec,
  sizes = "(max-width: 720px) 100vw, 50vw",
  priority = false,
  className,
  aspectRatio,
  compactPlaceholder,
}: ResponsiveImageProps) {
  const ratio = aspectRatio ?? specRatio(spec);

  if (!src) {
    return (
      <ImagePlaceholder
        spec={spec}
        ratio={ratio}
        className={className}
        compact={compactPlaceholder}
      />
    );
  }

  return (
    <img
      src={src}
      srcSet={imageSrcSet(src)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      style={{ aspectRatio: ratio }}
    />
  );
}
