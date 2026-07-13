import { useCallback, useEffect, useState } from 'react'

type ThemeScheme = 'default' | 'kpu' | 'batik'

const SCHEME_KEY = 'sianter-theme-scheme'

function getStoredScheme(): ThemeScheme {
  if (typeof window === 'undefined') return 'default'
  const stored = localStorage.getItem(SCHEME_KEY)
  if (stored === 'kpu') return 'kpu'
  if (stored === 'batik') return 'batik'
  return 'default'
}

function applyScheme(scheme: ThemeScheme) {
  if (scheme === 'kpu' || scheme === 'batik') {
    document.documentElement.setAttribute('data-theme', scheme)
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function useThemeScheme() {
  const [scheme, setSchemeState] = useState<ThemeScheme>(getStoredScheme)

  useEffect(() => {
    applyScheme(scheme)
  }, [scheme])

  const setScheme = useCallback((next: ThemeScheme) => {
    localStorage.setItem(SCHEME_KEY, next)
    setSchemeState(next)
  }, [])

  return { scheme, setScheme } as const
}