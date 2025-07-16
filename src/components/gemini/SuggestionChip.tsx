// SuggestionChip.tsx
"use client";

import { ChevronRight } from "lucide-react";

interface SuggestionChipProps {
    label: string;
    onClick: () => void;
    small?: boolean;
    icon?: React.ReactNode;
}

export function SuggestionChip({ label, onClick, small = false, icon }: SuggestionChipProps) {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex items-center gap-2 
                ${small ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-base'}
                bg-white hover:bg-gray-50 active:scale-95
                border-2 border-gray-200 hover:border-red-200
                rounded-full shadow-sm hover:shadow-md
                transition-all duration-200 
                whitespace-nowrap snap-start shrink-0
                font-medium font-merriweather-sans
                min-h-[40px] min-w-[80px]
            `}
            style={{ color: '#4A4F55' }}
        >
            {/* Ripple effect container */}
            <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 bg-red-500 opacity-0 group-active:opacity-10 transition-opacity duration-300" />
            </span>
            
            {/* Content */}
            <span className="relative flex items-center gap-2">
                {icon}
                <span className="line-clamp-1">{label}</span>
                <ChevronRight 
                    size={14} 
                    className="text-gray-400 group-hover:text-red-500 transition-colors duration-200 group-hover:translate-x-0.5" 
                />
            </span>
            
            {/* Hover gradient effect */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    );
}