import { useCallback, useEffect, useRef, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

interface ThemeHandle {
  mode: Theme
  toggle: () => void
}

function getSystemTheme() {
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  return isDarkMode ? 'dark' : 'light'
}

export function useTheme(): ThemeHandle {
  const initialValue = localStorage.getItem('theme') as Theme | null
  const [theme, setTheme] = useState<Theme>(initialValue ?? 'system')
  const usedThemRef = useRef<Theme[]>([])

  const handleSetTheme = (mode: Theme) => {
    if (mode === 'system') {
      localStorage.removeItem('theme')
      document.documentElement.classList.remove('light', 'dark')
      usedThemRef.current = []
    } else {
      localStorage.setItem('theme', mode)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(mode)
      usedThemRef.current.push(mode)
    }
  }

  useEffect(() => {
    handleSetTheme(theme)
  }, [theme])

  const handleThemeToggle = useCallback(() => {
    switch (theme) {
      case 'system': {
        const systemMode = getSystemTheme()
        if (systemMode === 'light') setTheme('dark')
        else setTheme('light')
        break
      }
      case 'light':
        if (usedThemRef.current.length >= 2) setTheme('system')
        else setTheme('dark')
        break
      case 'dark':
        if (usedThemRef.current.length >= 2) setTheme('system')
        else setTheme('light')
        break
    }
  }, [theme])

  return {
    mode: theme,
    toggle: handleThemeToggle
  }
}
