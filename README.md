# Puhi8 Personal Site

A single-page React site that shows your profile, skills, featured projects and full projects. Data comes from `myData.json`, including links, badges, connections, and markdown descriptions.


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
- Profile image path: `./src/profile.png`.
- Connection icons: `./src/img/<label>.png` or set `icon` fields in `myData.json`.
- Skill icons: `./src/img/<skill>.png` matching the `skills` names.
- To make the `longDescription` use the `./scripts/md-to-project.js note.md` to make it into a single line. 
