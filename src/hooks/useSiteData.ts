import { useEffect, useState } from 'react'
import { fetchSiteData } from '../lib/siteData'
import type { Badge, Connection, Project, Skill } from '../types'

interface SiteDataState {
  projects: Project[]
  skills: Skill[]
  connections: Connection[]
  badges: Badge[]
  loading: boolean
  error: string
}

const INITIAL_STATE: SiteDataState = {
  projects: [],
  skills: [],
  connections: [],
  badges: [],
  loading: true,
  error: '',
}

export function useSiteData() {
  const [state, setState] = useState<SiteDataState>(INITIAL_STATE)
  useEffect(() => {
    let isCancelled = false
    const load = async (): Promise<void> => {
      setState(current => ({ ...current, loading: true, error: '' }))
      try {
        const data = await fetchSiteData()
        if (!isCancelled) setState({
          ...data,
          loading: false,
          error: '',
        })
      }
      catch (error) {
        if (!isCancelled) setState(current => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load projects right now.',
        }))
      }
    }
    void load()
    return () => { isCancelled = true }
  }, [])
  return state
}
