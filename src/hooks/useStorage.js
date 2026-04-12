import { useState, useCallback } from 'react';
import { load, save } from '../storage';

export function useStorage(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));

  const setPersisted = useCallback((v) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? v(prev) : v;
      save(key, next);
      return next;
    });
  }, [key]);

  return [value, setPersisted];
}
