"use client";

import { FormEvent, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

export function SearchBar({ onSearch, isLoading, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="retro-panel flex flex-col gap-2 p-2 sm:flex-row sm:gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="TYPE ARTIST OR TRACK..."
          className="retro-input font-pixel flex-1 px-3 py-3 outline-none sm:py-4"
          disabled={isLoading}
          aria-label="Search keyword"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="retro-btn font-pixel shrink-0 px-5 py-3 sm:py-4"
        >
          {isLoading ? "LOADING..." : "SEARCH"}
        </button>
      </div>
    </form>
  );
}
