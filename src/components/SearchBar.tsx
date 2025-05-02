/*
File: src/components/SearchBar.tsx
Barra de búsqueda y filtro de categorías
*/
"use client";
import React from "react";

interface SearchBarProps {
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}
const categoriesList = [
  "Todos",
  "Playas",
  "Cultura",
  "EcoTurismo",
  "Gastronomía",
  "Historia",
  "Artesanías",
  "Spots Instagrameables",
];

export default function SearchBar({
  search,
  onSearch,
  category,
  onCategoryChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <input
        type="text"
        placeholder="Busca un destino..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {categoriesList.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}