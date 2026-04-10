import type { Project } from '../types'
import { Card as ProjectCard } from './ProjectComponents'

interface ProjectsPageProps {
  projects: Project[]
  categories: string[]
  selectedCategory: string
  search: string
  loading: boolean
  error: string
  onCategoryChange: (value: string) => void
  onSearchChange: (value: string) => void
  onBackHome: () => void
}

export default function ProjectsPage({
  projects,
  categories,
  selectedCategory,
  search,
  loading,
  error,
  onCategoryChange,
  onSearchChange,
  onBackHome,
}: ProjectsPageProps) {
  return <section className="card projects-card">
    <div className="section-header">
      <div>
        <p className="eyebrow">All work</p>
        <h2>Projects ({projects.length})</h2>
      </div>
      <div className="actions">
        <button className="pill-button" type="button" onClick={onBackHome}>
          Back home
        </button>
      </div>
    </div>

    <div className="filters">
      <label className="filter-control">
        <span>Category</span>
        <select
          value={selectedCategory}
          onChange={event => onCategoryChange(event.target.value)}
        >
          {categories.map(category => <option key={category} value={category}>
            {category === 'all' ? 'All' : category}
          </option>
          )}
        </select>
      </label>

      <label className="filter-control grow">
        <span>Search</span>
        <input
          type="text"
          placeholder="Name or description"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
    </div>

    {loading && <p className="muted">Loading projects...</p>}
    {!loading && error && <p className="error">{error}</p>}
    {!loading && !error && projects.length === 0 && (
      <p className="muted">No projects match those filters.</p>
    )}
    <div className="project-grid">
      {projects.map(project => <ProjectCard key={project.name} project={project} />)}
    </div>
  </section>
}
