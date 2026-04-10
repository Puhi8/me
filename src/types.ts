export type Theme = 'dark' | 'light'
export type Page = 'home' | 'projects'

export const PROJECT_LINK_ORDER = ['production', 'github', 'other'] as const

export type ProjectLinkKey = (typeof PROJECT_LINK_ORDER)[number]

export interface ProjectLinks {
  production?: string
  github?: string
  other?: string
}

export interface Project {
  name: string
  shortDescription?: string
  longDescription?: string
  category?: string
  links?: ProjectLinks
  importance?: number
}

export interface Skill {
  name: string
}

export interface Connection {
  label: string
  url: string
  icon?: string
}

export interface Badge {
  standOut?: boolean
  text: string
}

export interface SiteData {
  projects: Project[]
  skills: Skill[]
  connections: Connection[]
  badges: Badge[]
}

export interface ProjectLink {
  key: ProjectLinkKey
  label: string
  url: string
}
