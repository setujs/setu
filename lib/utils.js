/* eslint-disable no-extend-native */

Array.prototype.contains = function(element) {
  return (-1 !== this.indexOf(element))
}

Array.prototype.remove = function(element, howMany) {
  var idx
  if (-1 !== (idx = this.indexOf(element))) {
    this.splice(idx, howMany || 1)
  }
}

Object.keys = Object.keys || function(obj) {
  var keys = []
  for(var key in obj) {
    keys.push(key)
  }
  return keys
}

/* eslint-enable no-extend-native */

function utils__isArray(v) {
  return ('[object Array]' === Object.prototype.toString.call(v))
}

function utils__isObject(v) {
  return ('object' === typeof(v) && !utils__isArray(v))
}

function utils__shuntEvent(e) {
  if (e.preventDefault) {
    e.preventDefault()
  }
  if (e.stopPropagation) {
    e.stopPropagation()
  }
}

if (typeof Object.assign != 'function') {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }
      var to = Object(target)
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index]
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    },
    writable: true,
    configurable: true
  })
}
