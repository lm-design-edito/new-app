type ConsoleMethod = 'assert'
  |'count'
  |'countReset'
  |'debug'
  |'dir'
  |'dirxml'
  |'error'
  |'group'
  |'groupCollapsed'
  |'groupEnd'
  |'info'
  |'log'
  |'table'
  |'time'
  |'timeEnd'
  |'trace'
  |'warn'

type ConsoleMethodsParams = {
  assert: Parameters<typeof console.assert>
  count: Parameters<typeof console.count>
  countReset: Parameters<typeof console.countReset>
  debug: Parameters<typeof console.debug>
  dir: Parameters<typeof console.dir>
  dirxml: Parameters<typeof console.dirxml>
  error: Parameters<typeof console.error>
  group: Parameters<typeof console.group>
  groupCollapsed: Parameters<typeof console.groupCollapsed>
  groupEnd: Parameters<typeof console.groupEnd>
  info: Parameters<typeof console.info>
  log: Parameters<typeof console.log>
  table: Parameters<typeof console.table>
  time: Parameters<typeof console.time>
  timeEnd: Parameters<typeof console.timeEnd>
  trace: Parameters<typeof console.trace>
  warn: Parameters<typeof console.warn>
}

const logsTimeOrigin = new Date()

class Log<T extends ConsoleMethod = ConsoleMethod> {
  type: T
  data: ConsoleMethodsParams[T]
  time: Date
  stack: string
  constructor (type: T, data: ConsoleMethodsParams[T]) {
    this.type = type
    this.data = data
    this.time = new Date()
    this.stack = (new Error().stack ?? '')
  }

  get displayTime () {
    return this.time.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }) + `:${this.time.getMilliseconds()}`
  }

  get elapsedTimeMs () {
    return (this.time.getTime() - logsTimeOrigin.getTime()) / 1000
  }

  get displayStack () {
    return this.stack
      .split('\n')
      .map(line => line.trim())
      .slice(4)
      .join('\n')
  }
}

export default class Logger {
  #threads: Map<string, Log[]> = new Map()
  constructor () {
    // this.assert = this.assert.bind(this)
    // this.count = this.count.bind(this)
    // this.countReset = this.countReset.bind(this)
    // this.debug = this.debug.bind(this)
    this.dir = this.dir.bind(this)
    // this.dirxml = this.dirxml.bind(this)
    this.error = this.error.bind(this)
    // this.group = this.group.bind(this)
    // this.groupCollapsed = this.groupCollapsed.bind(this)
    // this.groupEnd = this.groupEnd.bind(this)
    // this.info = this.info.bind(this)
    this.log = this.log.bind(this)
    // this.table = this.table.bind(this)
    // this.time = this.time.bind(this)
    // this.timeEnd = this.timeEnd.bind(this)
    // this.trace = this.trace.bind(this)
    this.warn = this.warn.bind(this)
    this.setLog = this.setLog.bind(this)
    this.print = this.print.bind(this)
    this.printThreads = this.printThreads.bind(this)
  }

  // assert         (thread: string = '', ...args: ConsoleMethodsParams['assert'])         { this.setLog(thread, 'assert', args) }
  // count          (thread: string = '', ...args: ConsoleMethodsParams['count'])          { this.setLog(thread, 'count', args) }
  // countReset     (thread: string = '', ...args: ConsoleMethodsParams['countReset'])     { this.setLog(thread, 'countReset', args) }
  // debug          (thread: string = '', ...args: ConsoleMethodsParams['debug'])          { this.setLog(thread, 'debug', args) }
  dir            (thread: string = '', ...args: ConsoleMethodsParams['dir'])            { this.setLog(thread, 'dir', args) }
  // dirxml         (thread: string = '', ...args: ConsoleMethodsParams['dirxml'])         { this.setLog(thread, 'dirxml', args) }
  error          (thread: string = '', ...args: ConsoleMethodsParams['error'])          { this.setLog(thread, 'error', args) }
  // group          (thread: string = '', ...args: ConsoleMethodsParams['group'])          { this.setLog(thread, 'group', args) }
  // groupCollapsed (thread: string = '', ...args: ConsoleMethodsParams['groupCollapsed']) { this.setLog(thread, 'groupCollapsed', args) }
  // groupEnd       (thread: string = '', ...args: ConsoleMethodsParams['groupEnd'])       { this.setLog(thread, 'groupEnd', args) }
  // info           (thread: string = '', ...args: ConsoleMethodsParams['info'])           { this.setLog(thread, 'info', args) }
  log            (thread: string = '', ...args: ConsoleMethodsParams['log'])            { this.setLog(thread, 'log', args) }
  // table          (thread: string = '', ...args: ConsoleMethodsParams['table'])          { this.setLog(thread, 'table', args) }
  // time           (thread: string = '', ...args: ConsoleMethodsParams['time'])           { this.setLog(thread, 'time', args) }
  // timeEnd        (thread: string = '', ...args: ConsoleMethodsParams['timeEnd'])        { this.setLog(thread, 'timeEnd', args) }
  // trace          (thread: string = '', ...args: ConsoleMethodsParams['trace'])          { this.setLog(thread, 'trace', args) }
  warn           (thread: string = '', ...args: ConsoleMethodsParams['warn'])           { this.setLog(thread, 'warn', args) }
  
  setLog<T extends ConsoleMethod> (
    threadName: string,
    type: T,
    data: ConsoleMethodsParams[T]
  ): this {
    const log = new Log(type, data)
    const thread = this.#threads.get(threadName) ?? []
    this.#threads.set(threadName, [...thread, log])
    return this
  }

  print (this: Logger, threadFilter?: string, withStack?: boolean) {
    const allLogs = [...this.#threads.entries()]
      .map(([threadName, logs]) => logs.map(log => ({ threadName, log })))
      .flat()
      .sort((eltA, eltB) => (eltA.log.time.getTime() - eltB.log.time.getTime()))
      .filter(({ threadName }) => {
        if (threadFilter === undefined) return true
        return threadName === threadFilter
      })
    allLogs.forEach(({ threadName, log }) => {
      console.log(`%c${threadName}`, 'font-weight: 800; color: white; background: black; padding: 4px;', `+${log.elapsedTimeMs}s –`, log.displayTime);
      if (withStack === true) console.log(`%c${log.displayStack}`, 'color: grey; font-size: inherit;')
      ;(console[log.type] as any)(...log.data)
      console.log('')
    })
  }

  printThreads (this:Logger, withStack?: boolean) {
    [...this.#threads.entries()].forEach(([threadName, logs]) => {
      console.group(`%c${threadName}`, 'font-weight: 800; color: white; background: black; padding: 4px;')
      logs.forEach(log => {
        console.log(`+${log.elapsedTimeMs}s –`, log.displayTime)
        if (withStack === true) console.log(`%c${log.displayStack}`, 'color: grey; font-size: inherit;')
        ;(console[log.type] as any)(...log.data)
        console.log('')
      })
      console.groupEnd()
    })
  }
}
