
import { useEffect, useId, useRef, useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import {
  searchPlaces,
  type PlaceSuggestion,
} from '../services/api'

type Props = {
  value: PlaceSuggestion | null
  onChange: (place: PlaceSuggestion | null) => void
  label: string
  placeholder?: string
  required?: boolean
  city?: string
  country?: string
}

export default function PlaceAutocomplete({
  value,
  onChange,
  label,
  placeholder = 'Search for a real place...',
  required = false,
  city,
  country,
}: Props) {
  const inputId = useId()
  const searchVersion = useRef(0)

  const [query, setQuery] = useState(value?.displayName ?? '')
  const [results, setResults] = useState<PlaceSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    setQuery(value?.displayName ?? '')
  }, [value?.displayName])

  useEffect(() => {
    const version = ++searchVersion.current

    if (!open || value || query.trim().length < 3) {
      setResults([])
      setLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const searchText = [
          query.trim(),
          city,
          country,
        ]
          .filter(Boolean)
          .join(', ')
          .slice(0, 100)

        const response = await searchPlaces(searchText)

        if (searchVersion.current === version) {
          setResults(response.data)
        }
      } catch (err) {
        if (searchVersion.current === version) {
          setResults([])
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to search locations.'
          )
        }
      } finally {
        if (searchVersion.current === version) {
          setLoading(false)
        }
      }
    }, 500)

    return () => {
      window.clearTimeout(timer)
      searchVersion.current++
    }
  }, [query, open, value, city, country])

  function handleInputChange(text: string) {
    setQuery(text)
    setResults([])
    setError('')
    setTouched(true)
    setOpen(true)

    if (value) {
      onChange(null)
    }
  }

  function handleSelect(place: PlaceSuggestion) {
    onChange(place)
    setQuery(place.displayName)
    setResults([])
    setError('')
    setOpen(false)
    setTouched(true)
  }

  function handleClear() {
    onChange(null)
    setQuery('')
    setResults([])
    setError('')
    setOpen(false)
    setTouched(false)
  }

  const showValidation =
    required && touched && !value && !open

  return (
    <div className="relative min-w-0">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && ' *'}
      </label>

      <div className="relative mt-2">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={inputId}
          type="text"
          value={query}
          required={required}
          minLength={3}
          maxLength={255}
          autoComplete="off"
          placeholder={placeholder}
          aria-invalid={showValidation}
          aria-expanded={open && !value}
          aria-autocomplete="list"
          onChange={(event) =>
            handleInputChange(event.target.value)
          }
          onFocus={() => {
            if (!value) setOpen(true)
          }}
          onBlur={() => {
            setTouched(true)
            setOpen(false)
          }}
          className={`w-full min-w-0 rounded-xl border bg-white py-3 pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:ring-2 ${
            showValidation
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : value
                ? 'border-teal-400 focus:border-teal-600 focus:ring-teal-100'
                : 'border-slate-200 focus:border-teal-600 focus:ring-teal-100'
          }`}
        />

        {loading ? (
          <Loader2
            size={17}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-teal-700"
          />
        ) : query ? (
          <button
            type="button"
            aria-label="Clear location"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="mt-2 flex items-start gap-2 text-xs text-teal-700">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0"
          />
          <span>
            <strong>Location selected:</strong>{' '}
            {value.displayName}
          </span>
        </div>
      ) : (
        <p
          className={`mt-2 text-xs ${
            showValidation
              ? 'text-red-600'
              : 'text-slate-500'
          }`}
        >
          {showValidation
            ? 'Please select a location from the search suggestions.'
            : 'Type at least 3 characters and select a location from the suggestions.'}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {error}
        </p>
      )}

      {open && !value && query.trim().length >= 3 && (
        <div
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          {results.map((place, index) => (
            <button
              key={`${place.placeId}-${index}`}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(event) =>
                event.preventDefault()
              }
              onClick={() => handleSelect(place)}
              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-teal-50"
            >
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-teal-700"
              />

              <span className="min-w-0 break-words text-slate-700">
                {place.displayName}
              </span>
            </button>
          ))}

          {loading && results.length === 0 && (
            <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Searching locations...
            </div>
          )}

          {!loading &&
            !error &&
            results.length === 0 && (
              <p className="p-4 text-sm text-slate-500">
                No matching locations found. Try a more
                specific name.
              </p>
            )}
        </div>
      )}
    </div>
  )
}
