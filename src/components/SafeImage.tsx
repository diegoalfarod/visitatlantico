// components/SafeImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function SafeImage({ src, alt, fill, width, height, className }: SafeImageProps) {
  const [imageError, setImageError] = useState(false);

  // Si no hay src o hay error, mostrar placeholder
  if (!src || imageError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Imagen no disponible</p>
        </div>
      </div>
    );
  }

  // Para URLs de Google Maps, usar img regular en lugar de Next/Image
  if (src.includes('maps.googleapis.com')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : { width, height }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Para otras imágenes, usar Next/Image normal
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}