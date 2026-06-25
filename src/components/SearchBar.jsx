import { Search, X } from 'lucide-react';
const SearchBar = ({ value, onChange, placeholder = "Search products, stores, categories…" }) => (
  <div className="search-bar">
    <span className="search-bar-icon"><Search className="icon-sm" /></span>
    <input
      id="main-search"
      type="search"
      className="search-bar-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
    />
    {value && (
      <button className="search-bar-clear" onClick={() => onChange("")} aria-label="Clear search">
        <X className="icon-sm" />
      </button>
    )}
  </div>
);

export default SearchBar;
