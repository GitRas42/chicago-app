import { createContext, useContext, useState } from 'react'
import en from './en.js'
import sv from './sv.js'

const translations = { en, sv }

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'sv')

  function setLang(l) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(LangContext)
  const lang = ctx?.lang || 'sv'
  const dict = translations[lang] || translations.sv
  return {
    t: (key) => dict[key] ?? key,
    lang,
    setLang: ctx?.setLang ?? (() => {}),
  }
}
