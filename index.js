#!/usr/bin/env node

'use strict'
const moment = require('moment')
const isObject = (a) =>
  !!a && a.constructor === Object
const levels = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  off: 5
}
class Logger {
  constructor(options) {
    options = options || {}
    this.level = levels[options.level || 'off']
    // skipLevel: don't display the log level in output
    this.skipLevel = options.skipLevel
    // skipTime: don't display the log time in output
    this.skipTime = options.skipTime
    // messageLabel: use messageLabel as default label (instead of log level)
    this.messageLabel = options.messageLabel
    // indent: a number to use as indent level. See JSON.stringify(o, null, indent)
    this.indent = options.indent
    // replaceMessageLabelWithLevel: only matters if you pass JSON.
    // gives you consistency between just passing a bare string and
    // passing object. you can have both use log level as message
    // label.
    this.replaceMessageLabelWithLevel = options.replaceMessageLabelWithLevel
  }
  shouldLog(level) {
    return levels[level] >= this.level
  }
  log(o, level) {
    level = level || 'debug'
    const messageLabel = this.messageLabel || level
    if (!isObject(o)) {
      o = {
        level,
        time: moment().toISOString(),
        [messageLabel]: o
      }
    } else {
      o = Object.assign({
        level,
        time: moment().toISOString()
      }, o)
    }
    if (this.messageLabel && this.replaceMessageLabelWithLevel && o[messageLabel]) {
      o = Object.assign({
        level: o.level,
        time: o.time,
        [level]: o[messageLabel]
      }, o)
      delete o[messageLabel]
    }
    if (this.skipLevel) {
      delete o.level
    }
    if (this.skipTime) {
      delete o.time
    }
    console.log(JSON.stringify(o, null, this.indent))
  }
  trace(o) {
    if (this.shouldLog('trace')) {
      this.log(o, 'trace')
    }
  }
  debug(o) {
    if (this.shouldLog('debug')) {
      this.log(o, 'debug')
    }
  }
  info(o) {
    if (this.shouldLog('info')) {
      this.log(o, 'info')
    }
  }
  warn(o) {
    if (this.shouldLog('warn')) {
      this.log(o, 'warn')
    }
  }
  error(o) {
    if (this.shouldLog('error')) {
      this.log(o, 'error')
    }
  }
}
exports = module.exports = Logger
if (require.main === module) {
  const log = new Logger({
    level: 'info',
    messageLabel: 'message',
    replaceMessageLabelWithLevel: true,
    skipLevel: true
  })
  log.trace('hello trace')
  log.debug('hello debug')
  log.info('hello info')
  log.warn({
    message: 'Yo! Warning!!!',
    obj: {
      some: 'object here'
    }
  })
  log.error('hello error')
}
