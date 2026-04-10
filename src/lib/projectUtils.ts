import { PROJECT_LINK_ORDER, type Project, type ProjectLink, type ProjectLinkKey } from '../types'
import { withBase } from './sitePaths'

const PROJECT_LINK_LABELS: Record<ProjectLinkKey, string> = {
  production: 'Production',
  github: 'GitHub',
  other: 'Other',
}

export const getProjectCategory = (project: Project): string => (project.category || 'General')

export function toIconPath(label: string): string {
  const slug = String(label || '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return withBase(`/img/${slug || 'link'}.png`)
}

export function resolveIcon(pathStr?: string): string | null {
  if (!pathStr) return null
  if (/^https?:\/\//i.test(pathStr)) return pathStr
  return withBase(pathStr)
}

export function buildProjectLinks(project: Project): ProjectLink[] {
  const data = project.links || {}
  return PROJECT_LINK_ORDER.flatMap(key => data[key]
    ? [{ key, label: PROJECT_LINK_LABELS[key], url: data[key] }]
    : [],
  )
}

export function pickFeaturedProjects(projects: Project[]): Project[] {
  if (!projects.length) return []
  const weighted = projects
    .map(project => ({
      ...project,
      weight: (Number(project.importance) || 0) + Math.random() * 5,
    }))
    .sort((a, b) => b.weight - a.weight)

  const chosen: Project[] = []
  const usedCategories = new Set<string>()

  for (const project of weighted) {
    if (chosen.length === 3) break
    const category = getProjectCategory(project)
    if (!usedCategories.has(category)) {
      chosen.push(project)
      usedCategories.add(category)
    }
  }

  if (chosen.length < 3) for (const project of weighted) {
    if (chosen.length === 3) break
    if (!chosen.some(entry => entry.name === project.name)) chosen.push(project)
  }
  return chosen.slice(0, 3)
}

export function getProjectCategories(projects: Project[]): string[] {
  const categorySet = new Set<string>()
  projects.forEach(project => { if (project.category) categorySet.add(project.category) })
  return ['all', ...Array.from(categorySet)]
}

export function filterProjects(projects: Project[], selectedCategory: string, search: string): Project[] {
  let filtered = [...projects]
  if (selectedCategory !== 'all') filtered = filtered.filter(project => getProjectCategory(project) === selectedCategory)
  if (search.trim()) filtered = filtered.filter((project) => ([project.name, project.shortDescription || '', project.longDescription || '']
    .join(' ').toLowerCase().includes(search.trim().toLowerCase()))
  )
  return filtered.sort((a, b) => (Number(b.importance) || 0) - (Number(a.importance) || 0))
}
