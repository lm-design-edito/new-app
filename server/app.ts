import fs from 'node:fs'
import { join, extname } from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import Debug from 'debug'
import http from 'http'
import { glob } from 'glob'
import cors from 'cors'
import { lookup } from 'mime-types'
import { JSDOM } from 'jsdom'

const { readFile, readdir } = fs.promises

const CWD = process.cwd()
const abs = (...paths: string[]) => join(CWD, ...paths)

const FAVICON = abs('server/favicon.ico')
const ASSETS = process.env.NODE_ENV === 'production' ? abs('.dist/prod') : abs('.dist/dev')
const PAGES = abs('pages')

const app = express()
const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

const server = http.createServer(app)
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

app.use(cors({ origin: true }))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(ASSETS))

app.use('/favicon.ico', async (_, res) => {
  const fileContent = await readFile(FAVICON)
  res.type('image/x-icon')
  res.send(fileContent)
})

const listPages = async () => {
  const pagesFiles = await readdir(PAGES)
  return pagesFiles
}

const listAssets = async () => {
  const assetsFiles = (await glob(`${ASSETS}/**/*`))
    .filter(absPath => {
      const stats = fs.lstatSync(absPath)
      const ext = extname(absPath)
      const isDir = stats.isDirectory()
      return !isDir && ext !== '.map'
    })
    .map(absPath => absPath.replace(ASSETS, ''))
    .sort()
  return assetsFiles
}

const generateHomePage = async () => `<html class="lm-page">
  <head>
    <meta charsed="utf-8">
    <style>
      html { font-size: 16px; padding: 32px; padding-bottom: 160px; font-family: "Menlo", monospace; }
      body { margin: 0; }
      h2 { margin: 0; line-height: 1; }
    </style>
  </head>
  <body>
    <svg
      style="position: fixed; top: 32px;"
      width="64"
      height="64"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#1A171B"/>
      <path d="M69.08 134.58C68.43 134.58 67.79 134.58 67.14 134.68C71.65 135.33 74.23 137.69 75.09 140.48L76.7 139.51L76.59 139.19C76.27 138.12 74.66 134.69 69.08 134.58ZM73.16 118.48C74.77 116.76 75.41 114.4 75.41 110.75V79.4001C75.41 76.1801 74.45 75.8601 72.62 76.1801H72.4C73.69 77.3601 73.91 77.7801 73.91 81.5401V112.78C73.91 114.82 73.69 116.76 73.16 118.48Z" fill="#8F98A9"/>
      <path d="M87.87 129.32C84.97 126.21 80.89 124.27 75.09 124.27C64.04 124.38 53.51 132.32 49 137.26L50.18 138.76C56.4 134.04 63.91 131.99 69.18 132.1C74.76 132.31 77.88 135.42 78.95 138.43L94.09 129.41L92.7 126.62L87.87 129.32Z" fill="white"/>
      <path d="M61.46 77.0398C59.41 76.4998 57.7 75.3198 56.73 73.5998C55.65 71.6698 55.55 69.3098 56.41 66.8398C52.34 72.5298 55.12 77.5798 61.46 77.0398Z" fill="#8F98A9"/>
      <path d="M142.71 129.97L141.31 129.22C139.92 128.46 139.59 127.29 139.59 124.71V83.59C139.59 78.44 140.98 75.11 145.18 72.64L149.57 70.07L147.96 67.38L145.92 68.45C143.45 69.74 141.73 70.6 138.19 68.56L127.77 62.66L114.25 71.03L103.31 62.66L90.64 70.28C90.1 66.41 86.34 59.86 76.15 63.83C73.79 64.8 70.46 66.09 68.74 66.73C65.09 68.02 63.27 66.31 65.52 63.08L67.24 60.61L64.89 59C61.89 62.87 60.7 64.48 60.7 64.48C55.87 70.81 58.88 75.86 65.96 74.89C67.68 74.68 70.47 74.24 72.3 73.93C77.13 73.07 77.77 74.89 77.77 79.51V110.85C77.77 115.14 77.02 118.8 73.69 121.38L74.77 123.2L85.51 116.44C89.8 113.76 90.66 109.89 90.66 104.53V73.82L96.14 70.71L100.64 74.36C102.25 75.65 102.58 76.29 102.58 79.19V138.45H103.44C107.73 136.2 110.83 134.69 110.83 134.69C114.81 132.65 115.45 132.01 115.45 127.5V74.04L121.14 70.6L133.81 78.01L132.09 79.3C129.09 81.55 126.93 85.21 126.93 92.07V128.78C126.93 132.11 127.79 133.83 129.84 135.22L134.45 138.34L147.87 130.29L146.58 127.71L142.71 129.97Z" fill="white"/>
      <path d="M129.4 78.2299L121.14 73.3999L119.85 74.2499L128.44 79.2999C128.76 78.8599 129.08 78.5399 129.4 78.2299ZM124.57 128.78L124.46 92.0699C124.46 88.7399 124.89 85.8399 125.85 83.4799C124.14 85.8399 123.06 89.2699 123.06 94.2099V130.07C123.06 133.29 124.35 136.19 126.82 137.91L130.58 140.49L131.98 139.63L128.55 137.27C125.75 135.33 124.57 132.75 124.57 128.78ZM95.92 73.6099L94.3 74.4699L96.7701 76.3999C98.4901 77.6899 98.7 77.6899 98.7 80.5899V140.49H99.56C99.77 140.38 100.1 140.16 100.1 140.16V79.1899C100.1 77.4699 99.89 77.0399 99.14 76.2899C99.14 76.1799 97.21 74.6799 95.92 73.6099Z" fill="#8F98A9"/>
    </svg>
    <div style="margin-left: 96px;">
      <h2>Pages</h2><br />
      ${(await listPages()).sort().reverse().map(name => (
        `<a href="/pages/${name}/">/pages/${name}/</a>`
      )).join('<br /><br />')}
      <br /><br /><br />
      <h2>Assets</h2><br />
      ${(await listAssets()).map(name => (
        `<a href="${name}">${name}</a>`
      )).join('<br /><br />')}
    </div>
  </body>
</html>`

app.use('/', async (req, res, next) => {
  if (req.path !== '/') return next()
  const homePageContent = await generateHomePage()
  return res.type('text/html').send(homePageContent)
})

app.use('/pages', async (req, res, next) => {
  if (req.path === '/') return res.redirect('/')
  const HTML_TARGET = join(PAGES, req.path, 'index.html')
  const TARGET = join(PAGES, req.path)
  try {
    const fileContent = await readFile(HTML_TARGET, { encoding: 'utf-8' })
    if (!req.originalUrl.match(/\/$/)) return res.redirect(`${req.originalUrl}/`)
    const dom = new JSDOM(fileContent)
    const styleElement = dom.window.document.createElement('style')
    styleElement.innerHTML += 'html, body { margin: 0; padding: 0 }'
    dom.window.document.head.append(styleElement)
    const domStr = dom.window.document.documentElement.outerHTML
    return res.type('text/html').send(domStr)
  } catch (err) {
    try {
      const fileContent = await readFile(TARGET, { encoding: 'utf-8' })
      const mime = lookup(TARGET) || 'text/plain'
      return res.type(mime).send(fileContent)
    } catch (err) {
      return res.type('text/html').status(404).send('404')
    }
  }
})

function normalizePort (val: string) {
  const port = parseInt(val, 10)
  if (isNaN(port)) return val
  if (port >= 0) return port
  return false
}

function onError (error: any) {
  if (error.syscall !== 'listen') throw error
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

const debug = Debug('server:server')
function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port
  debug('Listening on ' + bind)
  console.log('Listening on ' + bind)
}
