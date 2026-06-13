import { useState, useEffect, useRef } from 'react';

/**
 * Debounces a value — only updates the returned value after
 * `delay` ms of inactivity. Useful for search inputs.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Formats a date string for display — use with useMemo upstream.
 */
export function formatEventDate(isoString: string) {
  const d = new Date(isoString);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Creates a stable debounced ref-backed function.
 * Avoids the useCallback + cast pattern that triggers react-hooks/use-memo lint rule.
 */
export function useDebouncedFn<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef<T>(callback);

  // Keep the latest callback in a ref so we never need it in the dep array
  useEffect(() => {
    callbackRef.current = callback;
  });

  return (...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
  };
}
