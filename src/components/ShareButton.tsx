"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ title }: { title: string }) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      navigator.share?.({
        title,
        url: window.location.href,
      }).catch((err) => console.error("Error sharing:", err));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
