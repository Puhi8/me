import { withBase } from '../lib/sitePaths'
import type { Project, Skill } from '../types'
import { Preview as ProjectPreview } from './ProjectComponents'

interface HomePageProps {
  skills: Skill[]
  featuredProjects: Project[]
  loading: boolean
  error: string
  onViewAllProjects: () => void
}

export default function HomePage({ skills, featuredProjects, loading, error, onViewAllProjects }: HomePageProps) {
  return <section className="grid">
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
          {skills.map(skill => <div className="skill-chip" key={skill.name}>
            <img src={withBase(`/img/${skill.name.toLowerCase()}.png`)} alt={skill.name} />
            <span>{skill.name}</span>
          </div>
          )}
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
          <button
            className="pill-button"
            type="button"
            onClick={onViewAllProjects}
          >
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
        {featuredProjects.map(project => <ProjectPreview key={project.name} project={project} />)}
      </div>
    </div>
  </section>
}
