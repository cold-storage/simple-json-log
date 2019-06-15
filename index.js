#!/usr/bin/env node

'use strict'
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
    this.timeFn = () => {
      return new Date().toISOString()
    }
    this.fixerFn = (o, propsToSkip) => {
      const fixed = {}
      Object.getOwnPropertyNames(o).forEach(function(key) {
        if (!propsToSkip || propsToSkip.indexOf(key) === -1) {
          fixed[key] = o[key]
        }
      });
      return fixed
    }
    this.replacerFn = (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (this.cache.indexOf(value) !== -1) {
          return
        }
        this.cache.push(value)
      }
      return value
    }
    Object.assign(this, options)
    for (let level of Object.keys(this.levels)) {
      this[level] = (message, json, propsToSkip) => {
        if (this.levels[level] >= this.levels[this.level]) {
          let options = {}
          if (this.timeFn) {
            options.time = this.timeFn()
          }
          if (this.levelElement) {
            options.level = level
          }
          const lbl = this.levelAsLabel ? level : this.label
          if (json) {
            options[lbl] = message
            options = Object.assign(options, this.fixerFn ? this.fixerFn(json, propsToSkip) : json)
          } else if (!isString(message)) {
            options = Object.assign(options, this.fixerFn ? this.fixerFn(message, propsToSkip) : message)
          } else {
            options[lbl] = message
          }
          this.cache = []
          this.out.write(`${JSON.stringify(options, this.replacerFn, this.indent)}\n`)
          this.cache = null
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

  log.info('This is our log.', log, ['out'])
  log.trace('You probably won\'t ever use this.')
  log.debug('This is quite a bit of detail.')
  log.info('Hello log world!')
  log.info('Hello log world!', {
    some: 'nice JSON here'
  })
  log.info({
    some: 'nice JSON here'
  })
  log.warn('Geting low on memory.', log, ['out'])
  log.error('Could not get the eggs.', new Error('The truck is out of gas.'), ['stack'])
  log.error(new Error('hard times!'))
  log.fatal('We crashed!')
}
