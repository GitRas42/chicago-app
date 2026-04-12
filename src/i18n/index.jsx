import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import sv from './sv';
import en from './en';
import { KEYS, load, save } from '../storage';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const settings = load(KEYS.settings, { language: 'sv' });
    return settings.language || 'sv';
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    save(KEYS.settings, { language: newLang });
  }, []);

  const t = useCallback((key) => {
    const dict = lang === 'en' ? en : sv;
    return dict[key] || sv[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
