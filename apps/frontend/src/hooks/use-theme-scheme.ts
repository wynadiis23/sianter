import { useCallback, useEffect, useState } from 'react'

type ThemeScheme = 'default' | 'kpu'

const SCHEME_KEY = 'sianter-theme-scheme'

function getStoredScheme(): ThemeScheme {
  if (typeof window === 'undefined') return 'default'
  const stored = localStorage.getItem(SCHEME_KEY)
  if (stored === 'kpu') return 'kpu'
  return 'default'
}

function applyScheme(scheme: ThemeScheme) {
  if (scheme === 'kpu') {
    document.documentElement.setAttribute('data-theme', 'kpu')
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