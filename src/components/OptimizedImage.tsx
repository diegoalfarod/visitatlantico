import Image from "next/image";

/**
 * Componente de imagen optimizada para Core Web Vitals
 * - Mejora LCP (Largest Contentful Paint)
 * - Lazy loading automático
 * - Placeholders blur
 * - Formatos modernos (AVIF/WebP)
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean; // Solo usar en imágenes above-the-fold
  className?: string;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = "",
  sizes = "100vw",
  objectFit = "cover",
  blurDataURL,
}: OptimizedImageProps) {
  const imageProps = {
    src,
    alt,
    className,
    priority,
    ...(fill
      ? {
          fill: true,
          sizes,
          style: { objectFit },
        }
      : {
          width: width!,
          height: height!,
        }),
    ...(blurDataURL && {
      placeholder: "blur" as const,
      blurDataURL,
    }),
  };

  return <Image {...imageProps} />;
}

/**
 * Componente específico para Hero images
 * Siempre usa priority para mejorar LCP
 */
export function HeroImage({
  src,
  alt,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      sizes="100vw"
      className={className}
      objectFit="cover"
    />
  );
}

/**
 * Genera blur data URL placeholder simple
 * Para una mejor experiencia, considera generar estos en build time
 */
export function getBlurDataURL(color: string = "#E5E7EB"): string {
  // SVG simple con color sólido
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}"/>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
