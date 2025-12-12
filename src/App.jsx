import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

const MYDATA_JSON_URL = "https://puhi8.github.io/me/myData.json"
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || ''

function withBase(path) {
   const str = String(path || '')
   if (str.startsWith('#')) return `${BASE}${str}`
   const clean = str.replace(/^\/+/, '')
   return `${BASE}/${clean}`
}

const PROJECTS_HASH = '#projects'
const HOME_PATH = withBase('/')
const PROJECTS_PATH = withBase(PROJECTS_HASH)
const getPageFromLocation = () => (window.location.hash === PROJECTS_HASH ? 'projects' : 'home')

function toIconPath(label) {
   const slug = String(label || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
   return withBase(`/img/${slug || 'link'}.png`)
}

function buildProjectLinks(project) {
   const map = {
      production: 'Production',
      github: 'GitHub',
      other: 'Other',
   }
   const order = ['production', 'github', 'other']
   const data = project.links || {}
   return order
      .map(key => (data[key] ? { key, label: map[key], url: data[key] } : null))
      .filter(Boolean)
}

function resolveIcon(pathStr) {
   if (!pathStr) return null
   if (/^https?:\/\//i.test(pathStr)) return pathStr
   return withBase(pathStr)
}

function pickFeaturedProjects(projects) {
   if (!projects?.length) return []

   const weighted = projects
      .map(project => ({
         ...project,
         weight: (Number(project.importance) || 0) + Math.random() * 5,
      }))
      .sort((a, b) => b.weight - a.weight)

   const chosen = []
   const usedCategories = new Set()

   // First pass: prefer variety in categories
   for (const project of weighted) {
      if (chosen.length === 3) break
      if (!usedCategories.has(project.category)) {
         chosen.push(project)
         usedCategories.add(project.category)
      }
   }

   // Second pass: fill remaining slots by weight
   if (chosen.length < 3) {
      for (const project of weighted) {
         if (chosen.length === 3) break
         if (!chosen.some(p => p.name === project.name)) chosen.push(project)
      }
   }

   return chosen.slice(0, 3)
}

function ProjectCard({ project }) {
   const [open, setOpen] = useState(false)
   const bodyRef = useRef(null)
   const [contentHeight, setContentHeight] = useState(0)
   const links = useMemo(() => buildProjectLinks(project), [project.links])

   useEffect(() => {
      if (bodyRef.current) setContentHeight(bodyRef.current.scrollHeight)
   }, [project.longDescription])

   useEffect(() => {
      const handleResize = () => {
         if (bodyRef.current) setContentHeight(bodyRef.current.scrollHeight)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
   }, [])

   return (
      <article className="project-card">
         <div className="project-header">
            <h3>{project.name}</h3>
            <div className="meta-tags">
               <span className="pill outline">{project.category || 'General'}</span>
            </div>
         </div>
         <div className="project-copy">
            <ReactMarkdown>
               {project.shortDescription || project.longDescription || ''}
            </ReactMarkdown>
         </div>
         <div className="project-options">
            {project.longDescription && (
               <button
                  type="button"
                  className="project-chip"
                  onClick={() => setOpen(v => !v)}
               >
                  {open ? 'Hide details' : 'Read more'}
               </button>
            )}
            {links.length > 0 && (
               <div className="link-row subtle">
                  {links.map(link => (
                     <a
                        key={link.key}
                        className="project-chip"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                     >
                        {link.label}
                     </a>
                  ))}
               </div>
            )}
         </div>
         {project.longDescription &&
            <div
               className="details-outer"
               style={{
                  maxHeight: open ? `${contentHeight}px` : '0px',
                  opacity: open ? 1 : 0,
                  marginTop: open ? '8px' : '0px',
               }}
            >
               <div ref={bodyRef} className="project-copy">
                  <ReactMarkdown>{project.longDescription}</ReactMarkdown>
               </div>
            </div>
         }

      </article>
   )
}

function ProjectPreview({ project }) {
   const links = useMemo(() => buildProjectLinks(project), [project.links])

   return (
      <article className="project-preview">
         <h3>{project.name}</h3>
         <div className="project-copy">
            <ReactMarkdown>
               {project.shortDescription || project.longDescription || ''}
            </ReactMarkdown>
         </div>
         {links.length > 0 && (
            <div className="link-row subtle">
               {links.map(link => (
                  <a
                     key={link.key}
                     className="project-chip"
                     href={link.url}
                     target="_blank"
                     rel="noreferrer"
                  >
                     {link.label}
                  </a>
               ))}
            </div>
         )}
      </article>
   )
}

export default function App() {
   const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
   const [projects, setProjects] = useState([])
   const [skills, setSkills] = useState([])
   const [connections, setConnections] = useState([])
   const [badges, setBadges] = useState([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState('')
   const [page, setPage] = useState(getPageFromLocation)
   const [selectedCategory, setSelectedCategory] = useState('all')
   const [search, setSearch] = useState('')

   useEffect(() => {
      const handleRouteChange = () => setPage(getPageFromLocation())
      window.addEventListener('popstate', handleRouteChange)
      window.addEventListener('hashchange', handleRouteChange)
      return () => {
         window.removeEventListener('popstate', handleRouteChange)
         window.removeEventListener('hashchange', handleRouteChange)
      }
   }, [])

   const navigate = (path) => {
      window.history.pushState({}, '', path)
      setPage(getPageFromLocation())
   }

   useEffect(() => {
      document.documentElement.dataset.theme = theme
      localStorage.setItem('theme', theme)
   }, [theme])

   useEffect(() => {
      let isCancelled = false
      const fetchData = async () => {
         setLoading(true)
         setError('')
         const sources = [withBase('/myData.json'), MYDATA_JSON_URL].filter(Boolean)
         for (const source of sources) {
            try {
               const response = await fetch(source)
               if (!response.ok) throw new Error(`Status ${response.status}`)
               const json = await response.json()
               if (isCancelled) return
               setProjects(Array.isArray(json.projects) ? json.projects : [])
               setSkills(Array.isArray(json.skills) ? json.skills : [])
               setConnections(Array.isArray(json.connections) ? json.connections : [])
               setBadges(Array.isArray(json.badges) ? json.badges : [])
               setLoading(false)
               return
            }
            catch (err) { console.warn(`Failed to load from ${source}`, err) }
         }
         if (!isCancelled) {
            setError('Unable to load projects right now.')
            setLoading(false)
         }
      }
      fetchData()
      return () => { isCancelled = true }
   }, [])

   const featuredProjects = useMemo(() => pickFeaturedProjects(projects), [projects])
   const categories = useMemo(() => {
      const set = new Set()
      projects.forEach(p => {
         if (p.category) set.add(p.category)
      })
      return ['all', ...Array.from(set)]
   }, [projects])

   const filteredProjects = useMemo(() => {
      let list = [...projects]
      if (selectedCategory !== 'all') {
         list = list.filter(p => (p.category || 'General') === selectedCategory)
      }
      if (search.trim()) {
         const q = search.trim().toLowerCase()
         list = list.filter(p => {
            const haystack = `${p.name} ${p.shortDescription || ''} ${p.longDescription || ''}`.toLowerCase()
            return haystack.includes(q)
         })
      }
      return list.sort((a, b) => (Number(b.importance) || 0) - (Number(a.importance) || 0))
   }, [projects, selectedCategory, search])

   return (
      <div className="app-shell">
         <div className="bg-texture" />
         <div className="content">
            <div className="top-bar">
               <button className="brand" type="button" onClick={() => navigate(HOME_PATH)}>Puhi8 - Personal Site</button>
               <button
                  className="theme-toggle"
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               >
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
               </button>
            </div>

            <section className="hero-card card">
               <div className="identity">
                  <div className="avatar-wrap">
                     <img src={withBase('/profile.png')} alt="Puhi8 profile" className="profile-photo" />
                     <div className="glow" />
                  </div>
                  <div>
                     <p className="eyebrow">Hello, it is I</p>
                     <h1>Puhi8</h1>
                     <p className="lede">
                        Discovering as much as possible about computers while I'm still alive.
                     </p>
                     <div className="connections">
                        {connections.map(connection => (
                           <a
                              key={`${connection.label}-${connection.url}`}
                              className="chip"
                              href={connection.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={connection.label}
                           >
                              <img
                                 src={resolveIcon(connection.icon) || toIconPath(connection.label)}
                                 alt={connection.label}
                                 className="connection-icon"
                              />
                           </a>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="badges">
                  {badges.map(badge => (
                     <span
                        key={badge.text}
                        className={`pill ${badge.standOut ? 'accent' : 'outline'}`}
                     >
                        {badge.text}
                     </span>
                  ))}
               </div>
            </section>

            {page === 'home' && (
               <section className="grid">
                  <div className="card skills-card">
                     <div className="section-header">
                        <div>
                           <p className="eyebrow">Capabilities</p>
                           <h2>Tools I use</h2>
                        </div>
                     </div>
                     {skills.length === 0
                        ? <p className="muted">Add skills to myData.json to see them here.</p>
                        : <div className="skill-grid">
                           {skills.map((skill) => {
                              const icon = withBase(`/img/${String(skill.name).toLowerCase()}.png`)
                              return <div className="skill-chip" key={skill.name}>
                                 <img src={icon} alt={skill.name} />
                                 <span>{skill.name}</span>
                              </div>
                           })}
                        </div>
                     }
                  </div>

                  <div className="card projects-card">
                     <div className="section-header">
                        <div>
                           <p className="eyebrow">Showcase</p>
                           <h2>Featured Projects</h2>
                        </div>
                        <div className="actions">
                           <button className="pill-button" type="button" onClick={() => navigate(PROJECTS_PATH)}>
                              All projects
                           </button>
                        </div>
                     </div>

                     {loading && <p className="muted">Loading projects...</p>}
                     {!loading && error && <p className="error">{error}</p>}

                     {!loading && !error && featuredProjects.length === 0 && (
                        <p className="muted">Add items to myData.json to surface them here.</p>
                     )}

                     <div className="project-grid">
                        {featuredProjects.map(project => (
                           <ProjectPreview key={project.name} project={project} />
                        ))}
                     </div>
                  </div>
               </section>
            )}

            {page === 'projects' && (
               <section className="card projects-card">
                  <div className="section-header">
                     <div>
                        <p className="eyebrow">All work</p>
                        <h2>Projects ({filteredProjects.length})</h2>
                     </div>
                     <div className="actions">
                        <button className="pill-button" type="button" onClick={() => navigate(HOME_PATH)}>Back home</button>
                     </div>
                  </div>

                  <div className="filters">
                     <label className="filter-control">
                        <span>Category</span>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                           {categories.map(category => (
                              <option key={category} value={category}>
                                 {category === 'all' ? 'All' : category}
                              </option>
                           ))}
                        </select>
                     </label>

                     <label className="filter-control grow">
                        <span>Search</span>
                        <input
                           type="text"
                           placeholder="Name or description"
                           value={search}
                           onChange={e => setSearch(e.target.value)}
                        />
                     </label>
                  </div>

                  {loading && <p className="muted">Loading projects...</p>}
                  {!loading && error && <p className="error">{error}</p>}

                  {!loading && !error && filteredProjects.length === 0 && (
                     <p className="muted">No projects match those filters.</p>
                  )}

                  <div className="project-grid">
                     {filteredProjects.map(project => (
                        <ProjectCard key={project.name} project={project} />
                     ))}
                  </div>
               </section>
            )}
         </div>
      </div>
   )
}
