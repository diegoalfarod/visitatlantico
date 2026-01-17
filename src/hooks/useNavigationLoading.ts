"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook para detectar estados de navegación
 *
 * @returns {boolean} isNavigating - true cuando hay una navegación en progreso
 *
 * @example
 * function MyComponent() {
 *   const isNavigating = useNavigationLoading();
 *
 *   if (isNavigating) {
 *     return <SkeletonGrid />;
 *   }
 *
 *   return <ActualContent />;
 * }
 */
export function useNavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);

    // Simular un pequeño delay para mostrar el skeleton
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return isNavigating;
}

/**
 * Hook para manejar loading states con timeout
 *
 * @param {boolean} isLoading - Estado de loading externo
 * @param {number} minDuration - Duración mínima en ms (default: 300)
 *
 * @returns {boolean} showLoading - true mientras dure el loading o minDuration
 *
 * @example
 * function MyComponent() {
 *   const { data, isLoading } = useSWR('/api/data');
 *   const showLoading = useLoadingState(isLoading);
 *
 *   if (showLoading) return <Skeleton />;
 *   return <Content data={data} />;
 * }
 */
export function useLoadingState(isLoading: boolean, minDuration = 300) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && !startTime) {
      setStartTime(Date.now());
      setShowLoading(true);
    }

    if (!isLoading && startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        setShowLoading(false);
        setStartTime(null);
      }, remaining);
    }
  }, [isLoading, startTime, minDuration]);

  return showLoading;
}
