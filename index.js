#!/usr/bin/env node

'use strict'
const util = require('util')
const isString = (o) =>
  typeof o === 'string' || o instanceof String
const removeKeysValues = (obj, keys, values) => {
  if (!keys && !values) {
    return
  }
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      removeKeysValues(obj[key], keys, values)
    } else {
      if (keys && keys.indexOf(key) !== -1) {
        delete obj[key]
      }
      if (values && values.indexOf(obj[key]) !== -1) {
        delete obj[key]
      }
    }
  }
}
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
    this.replacerFn = function(keysToSkip, valuesToSkip) {
      const cache = []
      return (key, value) => {
        if (keysToSkip && keysToSkip.indexOf(key) !== -1) {
          return
        }
        if (valuesToSkip && valuesToSkip.indexOf(value) !== -1) {
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
    const buildLog = (level, message, json, keysToSkip, valuesToSkip) => {
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
        valuesToSkip = keysToSkip
        keysToSkip = json
      }
      if (keysToSkip && !Array.isArray(keysToSkip)) {
        keysToSkip = [keysToSkip]
      }
      if (valuesToSkip && !Array.isArray(valuesToSkip)) {
        valuesToSkip = [valuesToSkip]
      }
      return {
        log,
        keysToSkip,
        valuesToSkip
      }
    }
    Object.assign(this, options)
    for (const level of Object.keys(this.levels)) {
      this[level] = (message, json, keysToSkip, valuesToSkip) => {
        if (this.levels[level] >= this.levels[this.level]) {
          const logKeys = buildLog(level, message, json, keysToSkip, valuesToSkip)
          this.out.write(`${JSON.stringify(
            logKeys.log,
            this.replacerFn ? this.replacerFn(logKeys.keysToSkip, logKeys.valuesToSkip) : null,
            this.indent)}\n`)
        }
      }
      this[`${level}UtilFormat`] = (message, json, keysToSkip, valuesToSkip) => {
        if (this.levels[level] >= this.levels[this.level]) {
          const logKeys = buildLog(level, message, json, keysToSkip, valuesToSkip)
          removeKeysValues(logKeys.log, logKeys.keysToSkip, logKeys.valuesToSkip)
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

log.info('Hello world!')
log.info('Hello world!', { some: 'JSON', password: 'letmein' })
log.info('Hello world!', { some: 'JSON', password: 'letmein' }, ['password'])
log.info('Hello world!', { some: 'JSON', password: 'letmein' }, [], ['letmein'])
log.info({ some: 'JSON', password: 'letmein' })
log.info({ some: 'JSON', password: 'letmein' }, 'password')
log.info({ some: 'JSON', password: 'letmein' }, null, 'letmein')
}
