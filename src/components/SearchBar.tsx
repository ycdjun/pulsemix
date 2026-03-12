/**
 * Search input and provider filter for the main content area.
 */

import type { MusicProvider } from '../types/music';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  providerFilter: MusicProvider | 'all';
  onProviderFilterChange: (value: MusicProvider | 'all') => void;
  onSearch: () => void;
  isSearching: boolean;
  spotifyLoggedIn: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  providerFilter,
  onProviderFilterChange,
  onSearch,
  isSearching,
  spotifyLoggedIn,
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="search"
        className="search-input"
        placeholder={spotifyLoggedIn ? 'Search Spotify…' : 'Log in to search Spotify'}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        disabled={!spotifyLoggedIn}
      />
      <select
        className="search-filter"
        value={providerFilter}
        onChange={(e) => onProviderFilterChange(e.target.value as MusicProvider | 'all')}
      >
        <option value="all">All</option>
        <option value="spotify">Spotify</option>
        <option value="soundcloud">SoundCloud</option>
      </select>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSearch}
        disabled={!spotifyLoggedIn || isSearching}
      >
        {isSearching ? 'Searching…' : 'Search'}
      </button>
    </div>
  );
}
