import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'

function serveExercisesPlugin() {
  return {
    name: 'serve-exercises',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/exercises/')) return next()
        const filePath = join(process.cwd(), url)
        if (!existsSync(filePath)) return next()
        const ext = extname(filePath).toLowerCase()
        const mime = ext === '.json' ? 'application/json'
          : (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg'
          : ext === '.png' ? 'image/png'
          : 'application/octet-stream'
        res.setHeader('Content-Type', mime)
        res.setHeader('Cache-Control', 'public, max-age=3600')
        res.end(readFileSync(filePath))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveExercisesPlugin()],
  server: { port: 8080, host: true }
})
