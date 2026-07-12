const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST      = path.join(__dirname, 'dist')
const EXERCISES = path.join(__dirname, 'exercises')
const PORT = 8080

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.glb':  'model/gltf-binary',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
  '.json': 'application/json',
}

const server = http.createServer((req, res) => {
  try {
    // Strip query string
    let urlPath = req.url.split('?')[0]

    // Serve exercise dataset files 
    if (urlPath.startsWith('/exercises/')) {
      const exercisePath = path.join(EXERCISES, urlPath.slice('/exercises/'.length))
      if (fs.existsSync(exercisePath)) {
        const ext  = path.extname(exercisePath).toLowerCase()
        const mime = MIME[ext] || 'application/octet-stream'
        const data = fs.readFileSync(exercisePath)
        res.writeHead(200, { 'Content-Type': mime, 'Content-Length': data.length, 'Cache-Control': 'public, max-age=3600' })
        res.end(data)
        return
      }
    }

    let filePath = path.join(DIST, urlPath)

    // If no extension or file doesn't exist goes to index.html
    if (!path.extname(filePath) || !fs.existsSync(filePath)) {
      filePath = path.join(DIST, 'index.html')
    }

    const ext  = path.extname(filePath).toLowerCase()
    const mime = MIME[ext] || 'application/octet-stream'
    const data = fs.readFileSync(filePath)

    res.writeHead(200, {
      'Content-Type':                mime,
      'Content-Length':              data.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control':               'no-cache',
    })
    res.end(data)
  } catch (e) {
    res.writeHead(500)
    res.end('Server error: ' + e.message)
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Visualising Strength running → http://localhost:${PORT}`)
})

server.on('error', err => {
  console.error('Server error:', err.message)
  process.exit(1)
})
