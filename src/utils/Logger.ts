import { createLogger, format, transports } from 'winston'
const { colorize, combine, simple, prettyPrint } = format
const { Console } = transports

const isProd = process.env.NODE_ENV === 'production'

const Logger = createLogger({
  format: combine(colorize(), simple()),
  transports: [new Console({ level: isProd ? 'warn' : 'debug' })]
})

if (!isProd) {
  Logger.debug('Logging initialized at debug level')
}

export default Logger