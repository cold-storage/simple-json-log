#!/usr/bin/env node

'use strict'
const util = require('util')
const isString = (o) =>
  typeof o === 'string' || o instanceof String
class Logger {
  constructor(options) {
    options = options || {}
    this.out = process.stdout
    this.level = 'off'
    this.label = 'message'
    this.levelAsLabel = true
    this.levelElement = false
    this.indent = 0
    this.levels = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5,
      off: 6
    }
    // this.toJSON = () => {
    //   const result = Object.assign({}, this)
    //   delete result.out
    //   return result
    // }
    this.timeFn = () => new Date().toISOString()
    this.replacerFn = function(keysToSkip) {
      const cache = []
      return (key, value) => {
        if (keysToSkip && keysToSkip.indexOf(key) !== -1) {
          return
        }
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            return
          }
          cache.push(value)
        }
        return value // eslint-disable-line
      }
    }
    const buildLog = (level, message, json, keysToSkip) => {
      let log = {}
      if (this.timeFn) {
        log.time = this.timeFn()
      }
      if (this.levelElement) {
        log.level = level
      }
      const lbl = this.levelAsLabel ? level : this.label
      if (isString(message)) {
        log[lbl] = message
        if (json) {
          log = Object.assign(log, json)
        }
      } else {
        log = Object.assign(log, message)
        keysToSkip = json
      }
      return {
        log,
        keysToSkip
      }
    }
    Object.assign(this, options)
    for (const level of Object.keys(this.levels)) {
      this[level] = (message, json, keysToSkip) => {
        if (this.levels[level] >= this.levels[this.level]) {
          const logKeys = buildLog(level, message, json, keysToSkip)
          this.out.write(`${JSON.stringify(
            logKeys.log,
            this.replacerFn ? this.replacerFn(logKeys.keysToSkip) : null,
            this.indent)}\n`)
        }
      }
      this[`${level}UtilFormat`] = (message, json, keysToSkip) => {
        if (this.levels[level] >= this.levels[this.level]) {
          const logKeys = buildLog(level, message, json, keysToSkip)
          if (logKeys.keysToSkip) {
            for (const key of logKeys.keysToSkip) {
              delete logKeys.log[key]
            }
          }
          let lg = util.format(logKeys.log)
          if (!this.indent) {
            lg = lg.replace(/\n */g, ' ')
          }
          this.out.write(`${lg}\n`)
        }
      }
    }
  }
}
exports = module.exports = Logger
if (require.main === module) {
  const fs = require('fs')

  // const log = new Logger({
  //   // out: fs.createWriteStream('./logfile'),
  //   level: 'trace',
  //   label: 'msg',
  //   levelAsLabel: false,
  //   levelElement: true,
  //   timeFn: false,
  //   indent: 3,
  //   // levels: {
  //   //   bat: 0,
  //   //   zoo: 1,
  //   //   monkey: 2
  //   // },
  //   // fixerFn: false,
  //   replacerFn: false,
  // })

  const findUp = require('find-up')
  const path = require('path')
  const optPath = findUp.sync('.sjl.js')
  const opts = require(path.relative(__dirname, optPath))
  const log = new Logger(opts)

  // log.info('This is our log.', log, ['out'])
  // log.trace('You probably won\'t ever use this.')
  // log.debug('This is quite a bit of detail.')
  // log.info('Hello log world!')
  // log.info('Hello log world!', {
  //   some: 'nice JSON here'
  // })
  // log.info({
  //   some: 'nice JSON here'
  // })
  // log.warn('Here is our log', log, ['out'])
  // log.warnUtilFormat('Here is our log', log, ['out'])
  // log.info('Hello log world!')
  // log.info('Hello log world!', { some: 'nice JSON here', password: 'letmein' })
  // log.info('Hello log world!', { some: 'nice JSON here', password: 'letmein' }, ['password'])
  // log.info({ some: 'nice JSON here', password: 'letmein' })
  // log.info({ some: 'nice JSON here', password: 'letmein' }, ['password'])
  log.info(log)
  log.infoUtilFormat(log)
}
