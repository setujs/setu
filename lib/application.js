var GAppElement,
  GAppName,
  GAppInitialHtml

function app__run(name, settings) {
  console.info('Setu.application -->')
  GAppElement = document.querySelector('['+ META_APP + ']')
  if(!GAppElement) {
    consoleError('Setu.application',
      'no element with', META_APP, 'attribute defined')
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
  GAppName = name
  GAppInitialHtml = GAppElement.innerHTML
  config__setup(settings.config || {})
  routes__setup(settings.routes || {})
  models__setup(settings.models, settings.modelFilters,
    settings.config && settings.config.models)
  res__setup(settings.resources || {})
  app__navigate()
}

function __app__reload() {
  console.info('Setu.application refresh -->')
  __app__flush()
  app__navigate()
}

function app__open(url) {
  console.info('Setu.application -->', url)
  history__push(url)
  app__navigate()
}

function __app__redirect(url) {
  console.info('Setu.application redirecting -->', url)
  history__replace(url)
  app__navigate()
}

function app__navigate() {
  __app__clear()
  __app__exec()
}

function __app__clear() {
  var toFlush = config__pathChangeFlush()
  if(utils__isObject(toFlush) && 'resources' in toFlush) {
    toFlush.resources.forEach(res__flushOne)
  }
  routes__clear()
  parser__clear()
  binds__clear()
  evals__clear()
  http__clear()
  __app__restoreOrigContent()
  console.info('Setu.application x')
}

function __app__restoreOrigContent() {
  GAppElement.innerHTML = GAppInitialHtml
}

function __app__exec() {
  routes__resolve(function() {
    if(routes__exists()) {
      if(routes__toRedirect()) {
        __app__redirect(routes__redirect())
      }
      else if(routes__toInclude()) {
        __app__handleInclude()
      } else {
        __app__handleLoaded()
      }
    } else {
      __app__handleLoaded()
    }
  })
}

function __app__handleInclude() {
  var url = routes__include()
  console.debug('Setu.application page needs', url)
  evals__add({queryparams: __app__findQueryParams()})
  if(routes__toFlush()) {
    __app__flush()
  }
  var required = routes__require() || []
  res__get(required, {}, function(values) {
    evals__add(values)
    observer__monitor(GAppElement)
    __app__loadHtml(url)
  })
}

function __app__findQueryParams() {
  var queryparams = {}
  if(window.location.search) {
    var querystring = window.location.search.replace(/^\?/, '')
    var params = querystring.split('&')
    params.forEach(function(param) {
      var pair = param.split('=')
      queryparams[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
    })
  }
  console.debug('Setu.application queryparams', queryparams)
  return queryparams
}

function __app__loadHtml(url) {
  if(GIncludes[url]) {
    __app__setHtml(GIncludes[url])
  } else {
    http__get(url, {}, function(response) {
      __app__setHtml(response.data)
      GIncludes[url] = response.data
    }, function(e) {
      var err = JSON.parse(e.message)
      events__fire(ns.EVENT_AJAX_ERROR, null, {status: err.status, error: err.error})
    })
  }
}

function __app__setHtml(html) {
  GAppElement.innerHTML = html + GAppInitialHtml
  if(!GAppElement.querySelectorAll(META_ATTRS_SELECTOR).length) {
    parser__endgame()
  }
}

function __app__flush() {
  res__clear()
  console.info('Setu.application resources x')
}

function __app__handleLoaded() {
  observer__monitor(GAppElement)
  GAppElement.querySelectorAll(META_ATTRS_SELECTOR)
  .forEach(function(element){
    parser__parseElement(element)
  })
  if(parser__isDone()) {
    parser__endgame()
  }
}

function app__isAppRoot(element) {
  return GAppElement === element
}

function app__descendents(selector) {
  return GAppElement.querySelectorAll(selector)
}

ns.run = app__run
ns.refresh = __app__reload
ns.open = app__open
ns.clear = parser__clear
ns.app = GAppElement
