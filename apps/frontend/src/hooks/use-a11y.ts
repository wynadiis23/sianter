import { useCallback, useEffect, useState } from 'react'

export type TextSize = 'normal' | 'large' | 'extra-large'
export type Contrast = 'normal' | 'high'

interface A11ySettings {
  textSize: TextSize
  contrast: Contrast
  dyslexicFont: boolean
}

const A11Y_KEY = 'sianter-a11y'

function getStoredSettings(): A11ySettings {
  if (typeof window === 'undefined') {
    return { textSize: 'normal', contrast: 'normal', dyslexicFont: false }
  }
  try {
    const raw = localStorage.getItem(A11Y_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<A11ySettings>
      return {
        textSize: ['normal', 'large', 'extra-large'].includes(
          parsed.textSize ?? '',
        )
          ? (parsed.textSize as TextSize)
          : 'normal',
        contrast: ['normal', 'high'].includes(parsed.contrast ?? '')
          ? (parsed.contrast as Contrast)
          : 'normal',
        dyslexicFont:
          typeof parsed.dyslexicFont === 'boolean'
            ? parsed.dyslexicFont
            : false,
      }
    }
  } catch {
    /* ignore corrupt data */
  }
  return { textSize: 'normal', contrast: 'normal', dyslexicFont: false }
}

function applySettings({ textSize, contrast, dyslexicFont }: A11ySettings) {
  const root = document.documentElement

  root.removeAttribute('data-a11y-text')
  root.removeAttribute('data-a11y-contrast')
  root.removeAttribute('data-a11y-dyslexic')

  if (textSize !== 'normal') {
    root.setAttribute('data-a11y-text', textSize)
  }
  if (contrast !== 'normal') {
    root.setAttribute('data-a11y-contrast', contrast)
  }
  if (dyslexicFont) {
    root.setAttribute('data-a11y-dyslexic', 'true')
  }
}

export function useA11y() {
  const [settings, setSettingsState] = useState<A11ySettings>(getStoredSettings)

  useEffect(() => {
    applySettings(settings)
  }, [settings])

  const setTextSize = useCallback((textSize: TextSize) => {
    setSettingsState((prev) => {
      const next = { ...prev, textSize }
      localStorage.setItem(A11Y_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setContrast = useCallback((contrast: Contrast) => {
    setSettingsState((prev) => {
      const next = { ...prev, contrast }
      localStorage.setItem(A11Y_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setDyslexicFont = useCallback((dyslexicFont: boolean) => {
    setSettingsState((prev) => {
      const next = { ...prev, dyslexicFont }
      localStorage.setItem(A11Y_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const resetA11y = useCallback(() => {
    const defaults: A11ySettings = {
      textSize: 'normal',
      contrast: 'normal',
      dyslexicFont: false,
    }
    localStorage.setItem(A11Y_KEY, JSON.stringify(defaults))
    setSettingsState(defaults)
  }, [])

  return {
    textSize: settings.textSize,
    contrast: settings.contrast,
    dyslexicFont: settings.dyslexicFont,
    setTextSize,
    setContrast,
    setDyslexicFont,
    resetA11y,
  } as const
}
