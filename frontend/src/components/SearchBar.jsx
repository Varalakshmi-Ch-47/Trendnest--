import { useState } from 'react';
import './Common.css';

function SearchBar({ initialValue = '', onSearch }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length > 100) {
      setError('Search text must be at most 100 characters');
      return;
    }
    setError('');
    onSearch(trimmed);
  };

  const handleClear = () => {
    setValue('');
    setError('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar-row">
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products by name"
          aria-label="Search products by name"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {(value || initialValue) && (
          <button type="button" className="btn btn-secondary" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      {error && <div className="field-error">{error}</div>}
    </form>
  );
}

export default SearchBar;