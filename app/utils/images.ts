const VARIANT_WIDTHS = [400, 800, 1600];
const RESIZABLE = /^(.*)\.(jpg|jpeg|png)$/i;

/** Backend кладёт варианты рядом с оригиналом: name.jpg → name_800.jpg. */
export function imageSrcSet(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const match = RESIZABLE.exec(url);
  if (!match) return undefined;
  return VARIANT_WIDTHS.map((width) => `${match[1]}_${width}.jpg ${width}w`).join(", ");
}

export function absoluteImageUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
}
