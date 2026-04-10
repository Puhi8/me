import { useEffect, useState } from 'react'
import type { Theme } from '../types'

function applyTheme(theme: Theme): void { document.documentElement.dataset.theme = theme }

function getInitialTheme(): Theme {
  const theme = window.localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  applyTheme(theme)
  return theme
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem('theme', theme)
  }, [theme])
  const toggleTheme = (): void => { setTheme(currentTheme => currentTheme === 'dark' ? 'light' : 'dark') }
  return { theme, toggleTheme }
}
