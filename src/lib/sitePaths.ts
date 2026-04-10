import type { Page } from '../types'

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || ''
const PROJECTS_HASH = '#projects'
export const HOME_PATH = withBase('/')
export const PROJECTS_PATH = withBase(PROJECTS_HASH)

export function withBase(path: string): string {
  const normalized = String(path || '')
  if (normalized.startsWith('#')) return `${BASE}${normalized}`
  const clean = normalized.replace(/^\/+/, '')
  return `${BASE}/${clean}`
}

export const getPageFromLocation = (): Page => (window.location.hash === PROJECTS_HASH ? 'projects' : 'home')
