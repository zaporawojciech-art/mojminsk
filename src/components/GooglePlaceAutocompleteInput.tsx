import { useEffect, useRef, useState } from 'react';
import { MapPin, X, Loader2, Sparkles } from 'lucide-react';
import {
  searchPlaces,
  hasGoogleMapsKey,
  type PlaceSuggestion,
} from '../services/googleMapsService';
import { cn } from './ui';

interface GooglePlaceAutocompleteInputProps {
  label: 'SKĄD' | 'DOKĄD';
  variant?: 'origin' | 'destination';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hasSwapButton?: boolean;
  onSelectSuggestion?: (suggestion: PlaceSuggestion) => void;
}

export function GooglePlaceAutocompleteInput({
  label,
  variant = label === 'SKĄD' ? 'origin' : 'destination',
  value,
  onChange,
  placeholder,
  className,
  hasSwapButton = false,
  onSelectSuggestion,
}: GooglePlaceAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Pobieranie sugestii z debounce
  const fetchSuggestions = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching place suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 220);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    setIsOpen(true);
    setHighlightedIndex(-1);
    fetchSuggestions(newVal);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
    fetchSuggestions(value);
  };

  const handleSelect = (suggestion: PlaceSuggestion) => {
    // Preferujemy przejrzysty format miejsca (np. "Warszawa, Rondo Wiatraczna" lub nazwa główna)
    const formatted =
      suggestion.mainText.includes('Mińsk') || suggestion.mainText.includes('Warszawa')
        ? suggestion.mainText
        : `${suggestion.mainText} · ${suggestion.secondaryText.split(',')[0]}`;

    onChange(formatted);
    onSelectSuggestion?.(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Obsługa klawiatury
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        fetchSuggestions(value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Zamknięcie po kliknięciu poza komponent
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasApiKey = hasGoogleMapsKey();

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-2.5 focus-within:ring-2 focus-within:ring-ink transition-all cursor-text">
        {/* Bullet Icon */}
        {variant === 'origin' ? (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink" aria-hidden />
        ) : (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink" aria-hidden />
        )}

        <div className={cn('min-w-0 flex-1', hasSwapButton ? 'pr-10' : 'pr-1')}>
          <div className="flex items-center gap-1.5">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
              {label}
            </span>
            {hasApiKey && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-ink-400 bg-white/70 px-1 py-0.2 rounded">
                <Sparkles className="h-2.5 w-2.5 text-coral" />
                Maps
              </span>
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-transparent text-[14.5px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
          />
        </div>

        {/* Clear & Loading states */}
        <div className={cn('flex items-center gap-1', hasSwapButton && 'mr-8')}>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-ink-400" aria-label="Wczytywanie..." />
          )}
          {value.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Wyczyść pole"
              className="grid h-6 w-6 place-items-center rounded-full text-ink-400 hover:bg-mist-200 hover:text-ink active:scale-95 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </label>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-2xl bg-white shadow-card-hover border border-mist-300 py-1.5 max-h-64 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3.5 py-1 flex items-center justify-between border-b border-mist-100 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              {hasApiKey ? 'Podpowiedzi Google Maps' : 'Popularne punkty i węzły'}
            </span>
            <span className="text-[10px] text-ink-400">Wybierz miejsce</span>
          </div>

          {suggestions.map((item, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(item)}
                className={cn(
                  'flex items-start gap-2.5 w-full px-3.5 py-2 text-left transition-colors',
                  isHighlighted ? 'bg-sky-50 text-sky-900' : 'hover:bg-mist text-ink',
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px]',
                    isHighlighted ? 'bg-sky-200 text-ink' : 'bg-mist-200 text-ink-500',
                  )}
                >
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold truncate leading-tight">{item.mainText}</p>
                  {item.secondaryText && (
                    <p className="text-[11px] text-ink-400 truncate mt-0.5 leading-tight">
                      {item.secondaryText}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
