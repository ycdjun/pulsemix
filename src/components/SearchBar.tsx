interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoggedIn: boolean;
  isSearching: boolean;
}

export function SearchBar({ value, onChange, onSearch, isLoggedIn, isSearching }: SearchBarProps) {
  return (
    <div className="search-row panel">
      <div className="search-copy">
        <h2>Search Spotify</h2>
        <p className="muted">SoundCloud samples are always available. Spotify search unlocks after login.</p>
      </div>

      <div className="search-controls">
        <input
          className="search-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={isLoggedIn ? 'Search a song or artist on Spotify' : 'Log in with Spotify to search'}
          disabled={!isLoggedIn || isSearching}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && isLoggedIn && !isSearching) {
              onSearch();
            }
          }}
        />
        <button className="button button-primary" onClick={onSearch} disabled={!isLoggedIn || isSearching}>
          {isSearching ? 'Searching…' : 'Search'}
        </button>
      </div>
    </div>
  );
}
