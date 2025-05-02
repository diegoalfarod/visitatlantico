// src/components/DestinationActions.tsx

"use client";

import React from "react";
import { Heart, Share2 } from "lucide-react";

interface Props {
  name: string;
}

export default function DestinationActions({ name }: Props) {
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: name,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    }
  };

  return (
    <>
      <button
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Heart className="w-5 h-5" />
      </button>

      <button
        onClick={handleShare}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </>
  );
}
