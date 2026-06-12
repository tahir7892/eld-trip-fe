import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { searchLocations } from '../api/tripsApi';

const POPULAR_LOCATIONS = [
  'New York, NY',
  'Chicago, IL',
  'Dallas, TX',
  'Los Angeles, CA',
  'Atlanta, GA',
  'Houston, TX',
  'Miami, FL',
  'Denver, CO',
  'Phoenix, AZ',
  'Seattle, WA',
];

function cityOnly(label) {
  const city = label.split(',')[0]?.trim();
  return city || label;
}

export default function LocationAutocomplete({
  name,
  value,
  onChange,
  placeholder,
  disabled,
  hasError,
  onBlur,
}) {
  const listId = useId();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const showPopular = open && !value.trim();
  const options = showPopular
    ? POPULAR_LOCATIONS.map((label) => ({ label }))
    : suggestions;

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchSuggestions = useCallback(async (query) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const results = await searchLocations(trimmed);
      if (requestId !== requestIdRef.current) return;
      setSuggestions(results);
      setActiveIndex(results.length ? 0 : -1);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setSuggestions([]);
      setActiveIndex(-1);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    onChange(name, nextValue);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(nextValue);
    }, 280);
  };

  const selectOption = (option) => {
    onChange(name, option.label);
    setSuggestions([]);
    closeDropdown();
    inputRef.current?.blur();
  };

  const handleKeyDown = (event) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }

    if (!open || options.length === 0) {
      if (event.key === 'Escape') closeDropdown();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    } else if (event.key === 'Escape') {
      closeDropdown();
    }
  };

  return (
    <div className="location-autocomplete" ref={wrapperRef}>
      <div className="location-input-wrap">
        <input
          ref={inputRef}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={hasError ? 'input-error' : ''}
          aria-invalid={hasError}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {loading && (
          <span className="location-input-spinner" aria-hidden="true">
            <Loader2 size={16} className="icon-spin" />
          </span>
        )}
      </div>

      {open && options.length > 0 && (
        <ul className="location-dropdown" id={listId} role="listbox">
          {showPopular && (
            <li className="location-dropdown-heading" aria-hidden="true">
              Popular locations
            </li>
          )}
          {options.map((option, index) => (
            <li key={`${option.label}-${index}`} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={`location-option ${activeIndex === index ? 'active' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <MapPin size={14} strokeWidth={2} />
                <span className="location-option-text">
                  <strong>{cityOnly(option.label)}</strong>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
