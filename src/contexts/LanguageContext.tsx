import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Lang, type TranslationKey } from '../i18n/translations'

interface LanguageContextType {
  lang: Lang
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  toggleLang: () => void
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let text = translations[lang][key] || key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{{${k}}}`, String(v))
        })
      }
      return text
    },
    [lang]
  )

  const toggleLang = useCallback(() => {
    setLangState(prev => (prev === 'en' ? 'zh' : 'en'))
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
