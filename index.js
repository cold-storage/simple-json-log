#!/usr/bin/env node

'use strict'
const isObject = (a) =>
  !!a && a.constructor === Object
class Logger {
  constructor(options) {
    options = options || {}
    this.out = process.stdout
    this.level = 'off'
    this.label = 'message'
    this.levelAsLabel = true
    this.levelElement = false
    this.time = () => {
      return new Date().toISOString()
    }
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
    Object.assign(this, options)
    for (let level of Object.keys(this.levels)) {
      this[level] = (message, json) => {
        if (this.levels[level] >= this.levels[this.level]) {
          let options = {}
          if (this.time) {
            options.time = this.time()
          }
          if (this.levelElement) {
            options.level = level
          }
          const lbl = this.levelAsLabel ? level : this.label
          if (json) {
            options[lbl] = message
            options = Object.assign(options, json)
          } else if (isObject(message)) {
            options = Object.assign(options, message)
          } else {
            options[lbl] = message
          }
          this.out.write(`${JSON.stringify(options, null, this.indent)}\n`)
        }
      }
    }
  }
}
exports = module.exports = Logger
if (require.main === module) {
  const fs = require('fs')
  const log = new Logger({
    // out: fs.createWriteStream('./logfile'),
    level: 'trace',
    // label: 'niceMessage',
    // levelAsLabel: false,
    // levelElement: true,
    // time: false,
    // indent: 2,
    // levels: {
    //   bat: 0,
    //   zoo: 1,
    //   monkey: 2
    // }
  })
  log.trace('You probably won\'t ever use this.')
  log.debug('This is quite a bit of detail.')
  log.info('Hello log world!')
  log.info('Hello log world!', {
    some: 'nice JSON here'
  })
  log.info({
    some: 'nice JSON here'
  })
  log.warn('Geting low on memory.')
  log.error('Could not get the eggs.', {
    message: 'oops',
    code: 39
  })
  log.fatal('We crashed!')
}
