#!/usr/bin/env node

'use strict'
const util = require('util')
const fs = require('fs')
const isFunction = (o) =>
  typeof o === 'function'
const isString = (o) =>
  typeof o === 'string' || o instanceof String
const assignOwnProperties = (keysToSkip = [], valuesToSkip = []) => {
  const cache = []
  const aop = (target, src) => {
    for (const key of Object.getOwnPropertyNames(src)) {
      if (keysToSkip.indexOf(key) !== -1) {
        continue
      }
      if (src[key] && !isFunction(src[key]) && !isString(src[key]) && Object.getOwnPropertyNames(src[key]).length) {
        if (cache.indexOf(src[key]) === -1) {
          cache.push(src[key])
          target[key] = Array.isArray(src[key]) ? [] : {}
          aop(target[key], src[key])
        }
      } else {
        if (valuesToSkip.indexOf(src[key]) !== -1) {
          continue
        }
        target[key] = isFunction(src[key]) ? '(function)' : src[key]
        if (Array.isArray(src[key])) {
          aop(target[key], src[key])
        }
      }
    }
    return target
  }
  return aop
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
    this.logLevelFile = null
    this.logLevelPollSeconds = null
    this.keysToSkip = []
    this.valuesToSkip = []
    this.timeFn = () => new Date().toISOString()
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
          keysToSkip = keysToSkip || []
          valuesToSkip = valuesToSkip || []
        } else {
          keysToSkip = []
          valuesToSkip = []
          json = {}
        }
      } else {
        valuesToSkip = keysToSkip || []
        keysToSkip = json || []
        json = message
      }
      if (isString(keysToSkip)) {
        keysToSkip = [keysToSkip]
      }
      if (isString(valuesToSkip)) {
        valuesToSkip = [valuesToSkip]
      }
      keysToSkip.push(...this.keysToSkip)
      valuesToSkip.push(...this.valuesToSkip)
      log = assignOwnProperties(keysToSkip, valuesToSkip)(log, json)
      return log
    }
    Object.assign(this, options)
    if (this.indent) {
      try {
        this.indent = parseInt(this.indent, 10)
      } catch (e) {
        // ignore
      }
    }
    const readLogLevelFile = () => {
      fs.readFile(this.logLevelFile, 'utf8', (err, data) => {
        if (!err) {
          this.level = data.trim()
        }
      })
    }
    if (this.logLevelFile) {
      readLogLevelFile()
      fs.watchFile(this.logLevelFile, {
        persistent: false,
        interval: 10000
      }, readLogLevelFile)
    }
    for (const level of Object.keys(this.levels)) {
      this[level] = (message, json, keysToSkip, valuesToSkip) => {
        if (this.levels[level] >= this.levels[this.level]) {
          const log = buildLog(level, message, json, keysToSkip, valuesToSkip)
          this.out.write(`${JSON.stringify(log, null, this.indent)}\n`)
        }
      }
      this[`${level}UtilFormat`] = (message, json, keysToSkip, valuesToSkip) => {
        if (this.levels[level] >= this.levels[this.level]) {
          let log = buildLog(level, message, json, keysToSkip, valuesToSkip)
          log = util.format(log)
          if (!this.indent) {
            log = log.replace(/\n */g, ' ')
          }
          this.out.write(`${log}\n`)
        }
      }
    }
  }
}
exports = module.exports = Logger
if (require.main === module) {
  const log = new Logger({
    // out: fs.createWriteStream('./logfile'),
    level: 'trace',
    // label: 'msg',
    // levelAsLabel: false,
    // levelElement: true,
    // timeFn: false,
    indent: 3,
    // levels: {
    //   bat: 0,
    //   zoo: 1,
    //   monkey: 2
    // },
    // replacerFn: false,
    // logLevelFile: 'log.level',
    // logLevelPollSeconds: 20,
    keysToSkip: ['wonder'],
    valuesToSkip: ['bread'],
  })

  const x = {
    i: {
      bread: 'wonder',
      other: {
        wonder: 'about',
        things: 'foo',
        xxx: 'bread'
      }
    }
  }
  log.info(x)

  // setInterval(() => {
  //   log.info(log.level)
  // }, 3000)

  // if ('0') {
  //   console.log(JSON.stringify({
  //     some: {
  //       json: 'foo'
  //     }
  //   }, null, '3'))
  // }

  // const e = new Error('What!?!')
  // console.log('e')
  // console.log(e)
  // console.log('`${e}`')
  // console.log(`${e}`)
  // console.log('e.message')
  // console.log(e.message)
  // console.log('e.stack')
  // console.log(e.stack)
  // console.log('`${util.format(e)}\n`')
  // process.stdout.write(`${util.format(e)}\n`)
  // console.log('')
  // process.stdout.write(JSON.stringify(new Error('What?')))
}
