import gulp from 'gulp'
import flatten from 'gulp-flatten'
import fs from 'fs'
import path from 'path'

export function dist(cb) {
  gulp.src(['packages/(**)/dist/(**)']).pipe(flatten()).pipe(gulp.dest('dist/'))

  cb()
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function scanPackages(dir) {
  const result = []
  const folders = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
  for (const folder of folders) {
    const folderName = folder.name
    const packageJsonPath = path.join(dir, folderName, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      result.push({
        name: capitalize(folderName),
        id: pkg.name || '',
        description: pkg.description || '',
        author: pkg.author || '',
        version: pkg.version || '',
        url: `${folderName}/index.html`
      })
    }
  }
  return result
}

export function demos(cb) {
  gulp
    .src(['packages/(**)/demo/(**)'])
    .pipe(flatten({ includeParents: 1 }))
    .pipe(gulp.dest('demos/out/'))

  gulp.src(['dist/(**).min.js']).pipe(gulp.dest('demos/out/dist/'))

  const packagesDir = path.join(import.meta.dirname, './packages')
  const outputFile = path.join(import.meta.dirname, './demos/out/packages.json')
  const data = scanPackages(packagesDir)

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2))
  console.log(`Generated ${outputFile}`)

  cb()
}
