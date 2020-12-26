var GLogLevels = {
  'error': 1,
  'warn': 2,
  'info': 3,
  'log': 4,
}

var GLogLevel = GLogLevels.log

function __log__dummy() {}

console.debug = console.debug || __log__dummy

console.time = console.time || __log__dummy
console.timeEnd = console.timeEnd || __log__dummy

var consoleTime = console.time || __log__dummy
var consoleTimeEnd = console.timeEnd || __log__dummy
var consoleInfo = console.info || __log__dummy
var consoleWarn = console.warn || __log__dummy
var consoleError = console.error || __log__dummy

function log__setLevel(level) {
  if (GLogLevels[level]) {
    GLogLevel = GLogLevels[level]
  }
  for (level in GLogLevels) {
    if (GLogLevels[level] <= GLogLevel) {
      console[level] = console[level] || __log__dummy
    } else {
      console[level] = __log__dummy
    }
  }
  consoleTime = __log__setupDummy('time', 'error')
  consoleTimeEnd = __log__setupDummy('timeEnd', 'error')
  console.time = __log__setupDummy('time', 'error')
  console.timeEnd = __log__setupDummy('timeEnd', 'error')
  consoleInfo = console.info
  consoleWarn = console.warn
  consoleError = console.error
  console.debug('Setu.log', 'level', GLogLevel)
}

function __log__setupDummy(member, against) {
  return (console[member] && __log__dummy !== console[against] ?
    console[member] :
    __log__dummy)
}
