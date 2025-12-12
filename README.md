# Puhi8 Personal Site

A single-page React site that shows your profile, skills, featured projects, and a full projects. Data comes from `my.json`, including links, badges, connections, and markdown descriptions.


## Data format (`my.json`)
Each project can include:
```json
{
  "name": "Project Name",
  "shortDescription": "One-liner",
  "longDescription": "Markdown text...",
  "category": "tool",
  "importance": 0,
  "links": {}
}
```

## Notes
- Profile image path: `/img/profile.png`.
- Connection icons: `/img/<label>.png` (auto-slugged) or set `icon` fields in `myData.json`.
- Skill icons: `/img/<skill>.png` matching the `skills` names.
