# Puhi8 Personal Site

A single-page site in plain TypeScript (no framework) that shows your profile, skills, featured projects and full projects. Data comes from `myData.json`, including links, badges, connections, and markdown descriptions.


## Data format (`myData.json`)
Each project can include:
```json
{
  "name": "Project Name",
  "shortDescription": "One-liner",
  "longDescription": "Markdown text...",
  "category": "tool",
  "importance": 0,
  "links": {
    "github": "https://github.com/username/repo",
    "production": "https://username.github.io/repo"
  }
}
```

## Notes
- Profile image path: `./src/profile.png` (or `.jpg`, `.webp`, ...). It becomes `profile.avif` and the `profile-icon.webp` favicon.
- Connection icons: `./src/img/<label>.svg` (or any image format) or set `icon` fields in `myData.json`.
- Skill icons: `./src/img/<skill>.svg` (or any image format) matching the `skills` names.
- `npm run img` (runs on `dev` and `build`) converts images to small webp icons in `public/`. If an icon has an `.svg` it is used and the raster is skipped.
- `npm run build` outputs a single `index.html` with the css and js inlined. Test it with `npm run preview` at `http://localhost:4173/me/`.
- To make the `longDescription` use the `./scripts/md-to-project.js note.md` to make it into a single line. 
