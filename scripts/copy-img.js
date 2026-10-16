import { existsSync } from "node:fs"
import { copyFile, mkdir, readdir } from "node:fs/promises"
import { dirname, extname, join, relative } from "node:path"
import sharp from "sharp"

const sourceDir = "src/img"
const outputDir = "public/img"
// sizes are about 3x the largest display size (icons 28px, profile 160px) so they stay sharp on high-DPI screens
// ponytail: everything in src/img is sized as an icon, give bigger images their own size if you add any
const imageSize = 96
const profileSize = 384
const faviconSize = 32
const convertibleExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tiff"]

const toWebp = (source, destination, size) => sharp(source)
  .resize(size, size, { fit: "inside", withoutEnlargement: true })
  .webp()
  .toFile(destination)

async function copyImage(source) {
  const extension = extname(source).toLowerCase()
  const name = source.slice(0, -extension.length)
  const destination = join(outputDir, relative(sourceDir, name))
  await mkdir(dirname(destination), { recursive: true })
  if (!convertibleExtensions.includes(extension)) return copyFile(source, destination + extension)
  // an svg with the same name is used instead, so the raster is not needed
  if (!existsSync(name + ".svg")) return toWebp(source, destination + ".webp", imageSize)
}

const entries = existsSync(sourceDir) ? await readdir(sourceDir, { recursive: true, withFileTypes: true }) : []
const files = entries.filter(entry => entry.isFile())
await Promise.all(files.map(file => copyImage(join(file.parentPath, file.name))))
console.log(`${files.length} files from ${sourceDir} processed into ${outputDir}`)

const profile = convertibleExtensions.map(extension => `src/profile${extension}`).find(existsSync)
if (!profile) console.log("No profile image found in src.")
else {
  // avif is about half the size of webp for photos
  await sharp(profile).resize(profileSize, profileSize, { fit: "inside", withoutEnlargement: true }).avif().toFile("public/profile.avif")
  await sharp(profile).resize(faviconSize, faviconSize).webp().toFile("public/profile-icon.webp")
  console.log(`${profile} written to public/profile.avif and public/profile-icon.webp`)
}
