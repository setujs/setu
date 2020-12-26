var GWindow = window,
  GSetVars = {},
  GEvent

function evals__clear() {
  for(var key in GSetVars) {
    delete GSetVars[key]
  }
  GSetVars = {}
  GEvent = undefined
  console.debug('Setu.evals x all', GSetVars)
}

function evals__set(key, value) {
  GSetVars[key] = value
}

function evals__add(object) {
  var setVals = {}
  for(var key in object) {
    if(object.hasOwnProperty(key)) {
      if(!GSetVars.hasOwnProperty(key) || GSetVars[key] !== object[key]) {
        var value = object[key]
        evals__set(key, value)
        setVals[key] = value
      }
    }
  }
  return setVals
}

function __evals__addToWindow() {
  GEvent = GWindow.event
  for(var key in GSetVars) {
    GWindow[key] = GSetVars[key]
  }
  console.debug('Setu.evals + window', Object.assign({}, GSetVars))
}

function __evals__removeFromWindow() {
  for(var key in GSetVars) {
    if(GWindow.hasOwnProperty(key)) {
      delete GWindow[key]
    }
  }
  GWindow.event = GEvent
  console.debug('Setu.evals x window', Object.assign({}, GSetVars))
}

function __evals__unset(resources) {
  for(var key in resources) {
    if(resources.hasOwnProperty(key)) {
      delete GSetVars[key]
    }
  }
}

/* eslint-disable no-eval */

function evals__doTemplate(resources, expr) {
  var setVals = evals__add(resources)
  __evals__addToWindow()
  /**
   * Template strings have these formats:
   * expr
   * expr | filter0 | filter1
   * The 2nd example is evaluated as: filter1(filter0(eval(expr)))
  */
  var ret = expr.replace(REGEX_TEMPLATE, function(match) {
    return __evals__evalTemplateMatch(match)
  })
  ret = ret.replace(REGEX_TRUTHY_TEMPLATE, function(match) {
    return __evals__evalTemplateMatch(match, true)
  })
  __evals__removeFromWindow()
  __evals__unset(setVals)
  /**
   * The return value is the original expression itself in case of failure.
   * This would lead to ongoing meta parsing step to fail in rendering the
   * page properly giving a visual cue to the developer. They can further
   * check the console to find out issues with the syntax then.
  */
  return ret
}

function __evals__evalTemplateMatch(match, truthy) {
  /**
   * Remove the template begin and end braces from matched template string.
   * Remove whitespace before and after '|' to allow splitting the template
   * expression around it.
   * Remove all whitespace from beginning and end of template string.
  */
  var parsed
  if(!truthy) {
    parsed = match.replace(/^{{/, '').replace(/}}$/, '')
  } else {
    parsed = match.replace(/^{!{/, '').replace(/}!}$/, '')
  }
  parsed = parsed.replace(/\s*\|\s*/, '|').trim()
  parts = parsed.split('|')
  try {
    var val = __evals__evalPipe(parts)
    if(!truthy) {
      /**
       * If <undefined> is returned by the above function, it indicates
       * a failure due to template string config of any nature. In that
       * case, this function returns the matched string component itself
       * indicating the caller of this a failure in eval'ing the expression
       * passed to this function.
      */
      return undefined !== val ? val : match
    } else {
      /**
       * For truthy templates, only truthy works!
      */
      return val ? val : match
    }
  } catch(e) {
    console.debug('Setu.evals ! template', match, parts, e.message, e.stack)
    /**
     * Any failure in evaling pipe-separated template expression
     * is indicated to the caller by returning the matched string component
     * itself implying it could not be parsed or eval'd
    */
    return match
  }
}

function __evals__evalPipe(parts) {
  /**
   * For parts of a template expression separated by pipes e.g.
   * expr | filter0 | filter1
   * and to achieve the result: filter1(filter0(eval(expr)))
   * The relevant steps are tried and in case any of them results
   * in an error in template string configuration or eval, this
   * function returns <undefined> to notify the caller of this
   * function of such an error condition.
  */
  var val = eval(parts[0])
  if(undefined === val) {
    console.debug('Setu.evals ! eval piped', parts[0])
    return undefined
  }
  for(var i = 1; i < parts.length; ++i) {
    var part = parts[i]
    if(filters__exists(part)) {
      val = filters__run(part, val)
    } else {
      console.debug('Setu.evals ! eval not-a-filter', part)
      return undefined
    }
    if(undefined === val) {
      console.debug('Setu.evals ! eval piped-filter', part)
      return undefined
    }
  }
  return val
}

function evals__doExpr(resources, expr) {
  var setVals = evals__add(resources)
  __evals__addToWindow()
  /**
   * This function is used to typically eval expressions associated
   * with meta attrs like loop, if and declare. Some
   * times, these expressions can be templates implying use of context
   * variables. Other times, these could be ready-to-eval javascript
   * expression strings. This function caters to both scenarios.
  */
  var result
  try {
    if(!syn__isTemplate(expr)) {
      /* Ready-to-eval javascript expression scene */
      result = eval(expr)
    } else {
      /**
       * Expression is a template, so first reduce it to the
       * result of parsing the template, and then eval it assuming
       * the template parsing resulted in a ready-to-eval javascript
       * expression string.
       * Since the resources to be available in runtime are already
       * in the runtime by calling evals__add above, the call to
       * evals__doTemplate is made with empty set of resources, as there
       * are no more resources to make available in runtime.
      */
      result = eval(evals__doTemplate({}, expr))
    }
  } catch (e) {
    console.debug('Setu.evals ! expr', expr, e.message, e.stack)
    /**
     * Failure in eval'ing an expression is indicated by returing the
     * original expression itself. This would ensure that the ongoing
     * Setu meta parsing would not render the page properly indicating
     * failures visually. A developer can see the console then to know
     * the reason of rendering failure.
    */
    result = expr
  }
  __evals__removeFromWindow()
  __evals__unset(setVals)
  return result
}

/* eslint-enable no-eval */

ns.set = function(key, value) {
  evals__set(key, value)
  __evals__addToWindow()
}
