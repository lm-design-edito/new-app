import fs from 'node:fs'
import { join } from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import Debug from 'debug'
import http from 'http'

const { readFile, readdir } = fs.promises

const CWD = process.cwd()
const abs = (...paths: string[]) => join(CWD, ...paths)

const FAVICON = abs('server/favicon.ico')
const ASSETS = process.env.NODE_ENV === 'production'
  ? abs('dist/prod')
  : abs('dist/dev')
const PUBLIC = abs('public')
const PAGES = abs('pages')

const app = express()
const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

const server = http.createServer(app)
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(ASSETS))
app.use(express.static(PUBLIC))

app.use('/favicon.ico', async (_, res) => {
  const fileContent = await readFile(FAVICON)
  res.type('image/x-icon')
  res.send(fileContent)
})

app.use('/', async (req, res, next) => {
  if (req.path === '/') {
    return res.type('text/html').send(`<html>
      <head><meta charsed="utf-8"></head>
      <body>
        <a href="/pages/">pages</a><br />
      </body>
    </html>`)
  }
  next()
})

const generateHomePage = (names: string[]) => `<html>
  <head><meta charsed="utf-8"></head>
  <body>${[...names].sort().map(name => (
    `<a href="/pages/${name}">${name}</a>`
  )).join('<br />')}</body>
</html>`

app.use('/pages', async (req, res, next) => {
  if (req.path === '/') {
    const pages = await readdir(PAGES)
    res.type('text/html')
    return res.send(generateHomePage(pages))
  }
  const TARGET = join(PAGES, req.path, 'index.html')
  try {
    const fileContent = await readFile(TARGET, { encoding: 'utf-8' })
    res.type('text/html')
    res.send(fileContent)
  } catch (err) {
    res.type('text/html')
    res.status(404)
    res.send('404')
  }
})

function normalizePort(val: string) {
  const port = parseInt(val, 10)
  if (isNaN(port)) return val
  if (port >= 0) return port
  return false
}

function onError(error: any) {
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
function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port
  debug('Listening on ' + bind)
  console.log('Listening on ' + bind)
}

