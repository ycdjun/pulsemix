interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  disabled?: boolean;
}

export function SearchBar({ query, onQueryChange, onSearch, disabled }: SearchBarProps) {
  return (
    <div className="search-row">
      <input
        className="input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search Spotify tracks"
        disabled={disabled}
      />
      <button className="button" onClick={onSearch} disabled={disabled || !query.trim()}>
        Search
      </button>
    </div>
  );
}
