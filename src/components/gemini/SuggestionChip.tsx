// SuggestionChip.tsx
"use client";

import { useCallback } from "react";

interface SuggestionChipProps {
  label: string;
  onClick: () => void;
  small?: boolean;
  isDark?: boolean;
  disabled?: boolean;
}

export function SuggestionChip({
  label,
  onClick,
  small = false,
  isDark = false,
  disabled = false,
}: SuggestionChipProps) {
  const handleClick = useCallback(() => {
    if (disabled) return;

    // Haptic feedback en móviles compatibles
    if (navigator.vibrate) navigator.vibrate(10);
    onClick();
  }, [onClick, disabled]);

  /* ------------------------------ Estilos ------------------------------ */
  const sizeClasses = small
    ? "px-3 py-1.5 text-sm"
    : "px-4 py-2 text-base";

  const baseLight =
    "bg-white border border-gray-200 text-gray-700 shadow-sm";
  const hoverLight =
    "hover:bg-gradient-to-tr hover:from-red-50 hover:to-white hover:border-red-300 hover:text-red-600 hover:shadow-md";
  const activeLight =
    "active:scale-95 active:shadow-lg";
  const focusRingLight =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400";

  const baseDark =
    "bg-gray-700 border border-gray-600 text-white shadow-sm";
  const hoverDark =
    "hover:bg-gradient-to-tr hover:from-gray-600 hover:to-gray-700 hover:border-gray-500 hover:text-red-300 hover:shadow-md";
  const activeDark =
    "active:scale-95 active:shadow-lg";
  const focusRingDark =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60";

  const disabledClasses =
    "opacity-50 cursor-not-allowed hover:shadow-none active:scale-100";

  const classes = `
    inline-flex items-center justify-center rounded-full font-medium transition-all duration-150
    ${sizeClasses}
    ${isDark ? `${baseDark} ${hoverDark} ${activeDark} ${focusRingDark}` : `${baseLight} ${hoverLight} ${activeLight} ${focusRingLight}`}
    ${disabled ? disabledClasses : "hover:scale-105"}
  `;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      disabled={disabled}
      className={classes.trim()}
      style={{ fontFamily: "Merriweather Sans", WebkitTapHighlightColor: "transparent" }}
    >
      {label}
    </button>
  );
}
