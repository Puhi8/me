import "./main.css"

interface ProjectLink {
  label: string
  url: string
}

interface Project {
  name: string
  shortDescription?: string
  longDescription?: string
  category: string
  importance: number
  links: ProjectLink[]
}

interface Connection {
  label: string
  url: string
  icon?: string
}

interface Badge {
  text: string
  standOut: boolean
}

interface SiteData {
  projects: Project[]
  skills: string[]
  connections: Connection[]
  badges: Badge[]
}

const base = import.meta.env.BASE_URL
const fallbackDataUrl = "https://puhi8.github.io/me/myData.json"
const linkLabels = { production: "Production", github: "GitHub", other: "Other" }
// resolved at build time, so icons without an svg fall back to the converted webp without a 404 request
const svgIcons = import.meta.glob<string>("./img/*.svg", { eager: true, query: "?url", import: "default" })

const element = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T
const themeButton = element("theme-toggle")
const categorySelect = element<HTMLSelectElement>("category")
const searchInput = element<HTMLInputElement>("search")
const projectGrid = element("projects")
const projectsStatus = element("projects-status")
const featuredStatus = element("featured-status")
let allProjects: Project[] = []

// data

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null
const asString = (value: unknown): string | undefined => typeof value === "string" ? value : undefined
const toList = <T>(value: unknown, parse: (entry: Record<string, unknown>) => T | undefined): T[] => Array.isArray(value)
  ? value.filter(isRecord).map(parse).filter(entry => entry !== undefined)
  : []

function parseProject(entry: Record<string, unknown>): Project | undefined {
  const name = asString(entry.name)
  const links = isRecord(entry.links) ? entry.links : {}
  if (!name) return undefined
  return {
    name,
    shortDescription: asString(entry.shortDescription),
    longDescription: asString(entry.longDescription),
    category: asString(entry.category) || "General",
    importance: typeof entry.importance === "number" ? entry.importance : 0,
    links: Object.entries(linkLabels).flatMap(([key, label]) => {
      const url = asString(links[key])
      return url ? [{ label, url }] : []
    })
  }
}

function parseSiteData(json: unknown): SiteData {
  const data: Record<string, unknown> = isRecord(json) ? json : {}
  return {
    projects: toList(data.projects, parseProject).sort((first, second) => second.importance - first.importance),
    skills: toList(data.skills, entry => asString(entry.name)),
    connections: toList(data.connections, entry => {
      const label = asString(entry.label)
      const url = asString(entry.url)
      return label && url ? { label, url, icon: asString(entry.icon) } : undefined
    }),
    badges: toList(data.badges, entry => {
      const text = asString(entry.text)
      return text ? { text, standOut: entry.standOut === true } : undefined
    })
  }
}

async function loadSiteData(): Promise<SiteData> {
  for (const source of [`${base}myData.json`, fallbackDataUrl]) {
    try {
      const response = await fetch(source)
      if (!response.ok) throw new Error(`Status ${response.status}`)
      return parseSiteData(await response.json())
    }
    catch (error) { console.warn(`Failed to load ${source}`, error) }
  }
  throw new Error("Unable to load projects right now.")
}

function pickFeatured(projects: Project[]): Project[] {
  const weighted = projects
    .map(project => ({ project, weight: project.importance + Math.random() * 5 }))
    .sort((first, second) => second.weight - first.weight)
    .map(entry => entry.project)
  const usedCategories = new Set<string>()
  const oneOfEachCategory = weighted.filter(project => {
    if (usedCategories.has(project.category)) return false
    usedCategories.add(project.category)
    return true
  })
  // prefers different categories, fills up with the rest when there are fewer than 3
  return [...new Set([...oneOfEachCategory, ...weighted])].slice(0, 3)
}

// markdown

const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`)

const inlineMarkdown = (text: string): string => text.split(/(`[^`]+`)/).map((part, index) => index % 2
  ? `<code>${escapeHtml(part.slice(1, -1))}</code>`
  : escapeHtml(part)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noreferrer\">$1</a>")
).join("")

// ponytail: covers headings, paragraphs, nested lists, code, bold, italic and links; swap in "marked" if descriptions need more
function renderMarkdown(source: string): string {
  let html = ""
  let paragraph: string[] = []
  const lists: { tag: string, indent: number }[] = []
  const closeParagraph = () => {
    if (paragraph.length) html += `<p>${inlineMarkdown(paragraph.join(" "))}</p>`
    paragraph = []
  }
  const closeLists = (indent: number) => {
    while (lists.length && lists.at(-1)!.indent > indent) html += `</li></${lists.pop()!.tag}>`
  }
  for (const line of source.split(/\r?\n/)) {
    const item = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/)
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (!line.trim()) closeParagraph()
    else if (item) {
      const indent = item[1].length
      const tag = item[2].endsWith(".") ? "ol" : "ul"
      closeParagraph()
      closeLists(indent)
      if (lists.at(-1)?.indent === indent && lists.at(-1)?.tag !== tag) closeLists(indent - 1)
      if (lists.at(-1)?.indent === indent) html += "</li><li>"
      else {
        html += `<${tag}><li>`
        lists.push({ tag, indent })
      }
      html += inlineMarkdown(item[3].trim())
    }
    else {
      closeLists(-1)
      if (!heading) paragraph.push(line.trim())
      else {
        closeParagraph()
        html += `<h${heading[1].length}>${inlineMarkdown(heading[2].trim())}</h${heading[1].length}>`
      }
    }
  }
  closeParagraph()
  closeLists(-1)
  return html
}

// templates

const slug = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
const iconPath = (name: string): string => svgIcons[`./img/${name}.svg`] ?? `${base}img/${name}.webp`

function connectionIcon({ label, icon }: Connection): string {
  if (!icon) return iconPath(slug(label) || "link")
  return /^https?:\/\//i.test(icon) ? icon : base + icon.replace(/^\/+/, "")
}

const connectionHtml = (connection: Connection): string => `<a class="chip" href="${escapeHtml(connection.url)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(connection.label)}">
  <span aria-hidden="true" class="connection-icon" style="--connection-icon-mask: url(&quot;${escapeHtml(connectionIcon(connection))}&quot;)"></span>
</a>`

const badgeHtml = (badge: Badge): string => `<span class="pill ${badge.standOut ? "accent" : "outline"}">${escapeHtml(badge.text)}</span>`

const skillHtml = (skill: string): string => `<div class="skill-chip">
  <img src="${escapeHtml(iconPath(skill.toLowerCase()))}" alt="${escapeHtml(skill)}" />
  <span>${escapeHtml(skill)}</span>
</div>`

const linksHtml = (links: ProjectLink[]): string => links.length === 0 ? "" : `<div class="link-row">${links
  .map(link => `<a class="project-chip" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${link.label}</a>`)
  .join("")}</div>`

const summaryHtml = (project: Project): string => `<div class="project-copy">${renderMarkdown(project.shortDescription || project.longDescription || "")}</div>`

const previewHtml = (project: Project): string => `<article class="project-preview">
  <h3>${escapeHtml(project.name)}</h3>
  ${summaryHtml(project)}
  ${linksHtml(project.links)}
</article>`

const cardHtml = (project: Project): string => `<article class="project-card">
  <div class="project-header">
    <h3>${escapeHtml(project.name)}</h3>
    <div class="meta-tags"><span class="pill outline">${escapeHtml(project.category)}</span></div>
  </div>
  ${summaryHtml(project)}
  <div class="project-options">
    ${project.longDescription ? "<button type=\"button\" class=\"project-chip\" data-toggle aria-expanded=\"false\">Read more</button>" : ""}
    ${linksHtml(project.links)}
  </div>
  ${project.longDescription ? `<div class="details-outer"><div class="project-copy">${renderMarkdown(project.longDescription)}</div></div>` : ""}
</article>`

const categoryHtml = (category: string): string => `<option value="${escapeHtml(category)}">${category === "all" ? "All" : escapeHtml(category)}</option>`

// page

function setStatus(target: HTMLElement, text: string, isError = false) {
  target.textContent = text
  target.className = isError ? "error" : "muted"
  target.hidden = !text
}

function setTheme(theme: string) {
  document.documentElement.dataset.theme = theme
  themeButton.textContent = theme === "dark" ? "Light mode" : "Dark mode"
  localStorage.setItem("theme", theme)
}

function showPage() {
  const isProjectsPage = location.hash === "#projects"
  element("home-page").hidden = isProjectsPage
  element("projects-page").hidden = !isProjectsPage
}

function navigate(url: string) {
  history.pushState(null, "", url)
  showPage()
}

function renderProjects() {
  const search = searchInput.value.trim().toLowerCase()
  const matches = allProjects.filter(project => (categorySelect.value === "all" || project.category === categorySelect.value)
    && [project.name, project.shortDescription, project.longDescription].join(" ").toLowerCase().includes(search))
  element("project-count").textContent = String(matches.length)
  projectGrid.innerHTML = matches.map(cardHtml).join("")
  setStatus(projectsStatus, matches.length ? "" : "No projects match those filters.")
}

setTheme(localStorage.getItem("theme") === "light" ? "light" : "dark")
showPage()

themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"))
element("home-link").addEventListener("click", () => navigate(base))
element("back-home").addEventListener("click", () => navigate(base))
element("all-projects").addEventListener("click", () => navigate("#projects"))
window.addEventListener("popstate", showPage)
categorySelect.addEventListener("change", renderProjects)
searchInput.addEventListener("input", renderProjects)
projectGrid.addEventListener("click", event => {
  const button = (event.target as Element).closest<HTMLButtonElement>("[data-toggle]")
  if (!button) return
  const isOpen = button.closest(".project-card")!.classList.toggle("open")
  button.textContent = isOpen ? "Hide details" : "Read more"
  button.ariaExpanded = String(isOpen)
})

try {
  const data = await loadSiteData()
  const featured = pickFeatured(data.projects)
  allProjects = data.projects
  element("connections").innerHTML = data.connections.map(connectionHtml).join("")
  element("badges").innerHTML = data.badges.map(badgeHtml).join("")
  element("skills").innerHTML = data.skills.length
    ? data.skills.map(skillHtml).join("")
    : "<p class=\"muted\">Add skills to myData.json to see them here.</p>"
  element("featured").innerHTML = featured.map(previewHtml).join("")
  setStatus(featuredStatus, featured.length ? "" : "Add items to myData.json to surface them here.")
  categorySelect.innerHTML = ["all", ...new Set(allProjects.map(project => project.category))].map(categoryHtml).join("")
  renderProjects()
}
catch (error) {
  const message = error instanceof Error ? error.message : "Unable to load projects right now."
  setStatus(featuredStatus, message, true)
  setStatus(projectsStatus, message, true)
}
