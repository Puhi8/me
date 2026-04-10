import {
  PROJECT_LINK_ORDER,
  type Badge,
  type Connection,
  type Project,
  type ProjectLinks,
  type SiteData,
  type Skill,
} from '../types'
import { withBase } from './sitePaths'

const MYDATA_JSON_URL = 'https://puhi8.github.io/me/myData.json'

const EMPTY_SITE_DATA: SiteData = {
  projects: [],
  skills: [],
  connections: [],
  badges: [],
}

const isRecord = (value: unknown): value is Record<string, unknown> => (typeof value === 'object' && value !== null)
const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined)
const asNumber = (value: unknown): number | undefined => (typeof value === 'number' && Number.isFinite(value) ? value : undefined)

function toItems<T>(value: unknown, parser: (entry: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return []
  return value.map(parser).filter((entry): entry is T => entry !== null)
}

function toProjectLinks(value: unknown): ProjectLinks | undefined {
  if (!isRecord(value)) return undefined
  const links: ProjectLinks = {}
  for (const key of PROJECT_LINK_ORDER) {
    const url = asString(value[key])
    if (url) links[key] = url
  }
  return Object.keys(links).length > 0 ? links : undefined
}

function toProject(value: unknown): Project | null {
  if (!isRecord(value)) return null
  const name = asString(value.name)
  if (!name) return null
  return {
    name,
    shortDescription: asString(value.shortDescription),
    longDescription: asString(value.longDescription),
    category: asString(value.category),
    links: toProjectLinks(value.links),
    importance: asNumber(value.importance),
  }
}

function toSkill(value: unknown): Skill | null {
  if (!isRecord(value)) return null
  const name = asString(value.name)
  return name ? { name } : null
}

function toConnection(value: unknown): Connection | null {
  if (!isRecord(value)) return null
  const label = asString(value.label)
  const url = asString(value.url)
  if (!label || !url) return null
  return { label, url, icon: asString(value.icon) }
}

function toBadge(value: unknown): Badge | null {
  if (!isRecord(value)) return null
  const text = asString(value.text)
  if (!text) return null
  return { text, standOut: value.standOut === true }
}

export function parseSiteData(value: unknown): SiteData {
  if (!isRecord(value)) return EMPTY_SITE_DATA
  return {
    projects: toItems(value.projects, toProject),
    skills: toItems(value.skills, toSkill),
    connections: toItems(value.connections, toConnection),
    badges: toItems(value.badges, toBadge),
  }
}

export async function fetchSiteData(): Promise<SiteData> {
  const sources = [withBase('/myData.json'), MYDATA_JSON_URL].filter(Boolean)
  for (const source of sources) {
    try {
      const response = await fetch(source)
      if (!response.ok) throw new Error(`Status ${response.status}`)
      const json: unknown = await response.json()
      return parseSiteData(json)
    }
    catch (error) { console.warn(`Failed to load from ${source}`, error) }
  }
  throw new Error('Unable to load projects right now.')
}
