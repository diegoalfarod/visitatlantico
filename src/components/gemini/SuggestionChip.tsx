import { ReactNode } from "react";
import { ArrowRight, Shield } from "lucide-react";

export function SuggestionChip({
  label,
  onClick,
  icon,
  small = false,
  variant = "default"
}: {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  small?: boolean;
  variant?: "default" | "primary" | "accent";
}) {

  /* ─── Variantes de estilo institucional ─── */
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-red-600 hover:bg-red-700 text-white border-red-600";
      case "accent":
        return "bg-gray-600 hover:bg-gray-700 text-white border-gray-600";
      default:
        return "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300";
    }
  };

  /* ─── Detectar si el label contiene emoji ─── */
  const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(label);
  
  /* ─── Extraer emoji y texto ─── */
  const emojiMatch = hasEmoji ? label.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u) : null;
  const emoji = emojiMatch ? emojiMatch[0] : null;
  const textWithoutEmoji = emoji ? label.replace(emoji, '').trim() : label;

  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md border ${
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${getVariantStyles()} font-poppins`}
    >
      {/* Content */}
      <div className="flex items-center gap-2">
        {/* Icon or Emoji */}
        {emoji ? (
          <span className="text-base">
            {emoji}
          </span>
        ) : icon ? (
          <span className="text-current">
            {icon}
          </span>
        ) : (
          <Shield 
            size={small ? 12 : 14} 
            className="text-current opacity-70 group-hover:opacity-100 transition-opacity"
          />
        )}

        {/* Text */}
        <span className="font-medium font-merriweather-sans">
          {textWithoutEmoji}
        </span>

        {/* Arrow on hover */}
        <ArrowRight 
          size={small ? 10 : 12} 
          className="opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" 
        />
      </div>
    </button>
  );
}