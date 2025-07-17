// TypingIndicator.tsx
"use client";

interface TypingIndicatorProps {
  isDark?: boolean;
}

export function TypingIndicator({ isDark = false }: TypingIndicatorProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-md
        ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}
        shadow-sm
      `}
    >
      <div className="flex items-center gap-1">
        <span
          className={`w-2 h-2 rounded-full animate-bounce ${
            isDark ? "bg-gray-400" : "bg-gray-500"
          }`}
          style={{ animationDelay: "0ms" }}
        />
        <span
          className={`w-2 h-2 rounded-full animate-bounce ${
            isDark ? "bg-gray-400" : "bg-gray-500"
          }`}
          style={{ animationDelay: "150ms" }}
        />
        <span
          className={`w-2 h-2 rounded-full animate-bounce ${
            isDark ? "bg-gray-400" : "bg-gray-500"
          }`}
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span
        className={`text-sm ml-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        style={{ fontFamily: "Merriweather Sans" }}
      >
        escribiendo
      </span>
    </div>
  );
}