import { useEffect, useState } from 'react'
import { getPageFromLocation } from '../lib/sitePaths'
import type { Page } from '../types'

export function usePage() {
  const [page, setPage] = useState<Page>(getPageFromLocation)
  useEffect(() => {
    const handleRouteChange = (): void => { setPage(getPageFromLocation()) }
    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('hashchange', handleRouteChange)
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('hashchange', handleRouteChange)
    }
  }, [])
  const navigate = (path: string): void => {
    window.history.pushState({}, '', path)
    setPage(getPageFromLocation())
  }
  return { page, navigate }
}
