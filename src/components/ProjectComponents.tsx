import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildProjectLinks, getProjectCategory } from '../lib/projectUtils'
import type { Project, ProjectLink } from '../types'

interface ProjectProps {
  project: Project
}

export function Card({ project }: ProjectProps) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const links = useMemo(() => buildProjectLinks(project), [project])

  useEffect(() => { if (bodyRef.current) setContentHeight(bodyRef.current.scrollHeight) }, [project.longDescription])
  useEffect(() => {
    const handleResize = (): void => { if (bodyRef.current) setContentHeight(bodyRef.current.scrollHeight) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <article className="project-card">
    <div className="project-header">
      <h3>{project.name}</h3>
      <div className="meta-tags">
        <span className="pill outline">{getProjectCategory(project)}</span>
      </div>
    </div>
    <div className="project-copy"><ReactMarkdown>
      {project.shortDescription || project.longDescription || ''}
    </ReactMarkdown></div>
    <div className="project-options">
      {project.longDescription && <button
        type="button"
        className="project-chip"
        onClick={() => setOpen(value => !value)}
      >
        {open ? 'Hide details' : 'Read more'}
      </button>}
      <Links links={links} />
    </div>
    {project.longDescription && <div
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
    </div>}
  </article>
}

interface ProjectLinksProps {
  links: ProjectLink[]
}

export function Links({ links }: ProjectLinksProps) {
  if (links.length === 0) return null
  return <div className="link-row subtle">
    {links.map(link => <a
      key={link.key}
      className="project-chip"
      href={link.url}
      target="_blank"
      rel="noreferrer"
    >
      {link.label}
    </a>
    )}
  </div>
}

export const Preview = ({ project }: ProjectProps) => (
  <article className="project-preview">
    <h3>{project.name}</h3>
    <div className="project-copy">
      <ReactMarkdown>
        {project.shortDescription || project.longDescription || ''}
      </ReactMarkdown>
    </div>
    <Links links={useMemo(() => buildProjectLinks(project), [project])} />
  </article>
)
