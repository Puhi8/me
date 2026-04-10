import { useMemo, useState } from 'react'
import './App.css'
import HeroCard from './components/HeroCard'
import HomePage from './components/HomePage'
import ProjectsPage from './components/ProjectsPage'
import { usePage } from './hooks/usePage'
import { useSiteData } from './hooks/useSiteData'
import { useTheme } from './hooks/useTheme'
import { HOME_PATH, PROJECTS_PATH } from './lib/sitePaths'
import { filterProjects, getProjectCategories, pickFeaturedProjects } from './lib/projectUtils'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { page, navigate } = usePage()
  const { projects, skills, connections, badges, loading, error } = useSiteData()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const featuredProjects = useMemo(
    () => pickFeaturedProjects(projects),
    [projects],
  )
  const categories = useMemo(
    () => getProjectCategories(projects),
    [projects],
  )
  const filteredProjects = useMemo(
    () => filterProjects(projects, selectedCategory, search),
    [projects, search, selectedCategory],
  )
  return <div className="app-shell">
    <div className="bg-texture" />
    <div className="content">
      <div className="top-bar">
        <button
          className="brand"
          type="button"
          onClick={() => navigate(HOME_PATH)}
        >
          Puhi8 - Personal Site
        </button>
        <button className="theme-toggle" type="button" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      <HeroCard connections={connections} badges={badges} />

      {page === 'home' && (
        <HomePage
          skills={skills}
          featuredProjects={featuredProjects}
          loading={loading}
          error={error}
          onViewAllProjects={() => navigate(PROJECTS_PATH)}
        />
      )}

      {page === 'projects' && (
        <ProjectsPage
          projects={filteredProjects}
          categories={categories}
          selectedCategory={selectedCategory}
          search={search}
          loading={loading}
          error={error}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearch}
          onBackHome={() => navigate(HOME_PATH)}
        />
      )}
    </div>
  </div>
}
