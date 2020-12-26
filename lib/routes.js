var GRoutes,
  GCurrentRoute,
  GPath

function routes__setup(routes) {
  GRoutes = routes
  routes__clear()
}

function routes__resolve(onsuccess) {
  __routes__findPath()
  var routeDef
  if(!(routeDef = routes__getDef(GPath))) {
    onsuccess()
    return
  }
  __routes__processDef(routeDef, onsuccess)
}

function routes__clear() {
  GCurrentRoute = GPath = undefined
  console.info('Setu.routes x all')
}

function routes__getDef(path) {
  if(GRoutes[path]) {
    return GRoutes[path]
  }
  for(var key in GRoutes) {
    if(path.match(new RegExp(key))) {
      return GRoutes[key]
    }
  }
  return false
}

function __routes__findPath() {
  var pathFromHistory = history__changedPath()
  if(pathFromHistory) {
    GPath = pathFromHistory
    history__eraseChange()
    console.info('Setu.routes history', GPath)
  } else {
    GPath = location.pathname.replace(/\/$/, '')
    console.info('Setu.routes location', GPath)
  }
}

function __routes__processDef(routeDef, onsuccess) {
  if('function' === typeof(routeDef)) {
    routeDef(function(ret) {
      __routes__finish(ret, onsuccess)
    })
  } else {
    __routes__finish(routeDef, onsuccess)
  }
}

function __routes__finish(routeDef, onsuccess) {
  GCurrentRoute = routeDef
  console.info('Setu.routes $ resolve', GPath, GCurrentRoute)
  onsuccess()
}

function routes__exists() {
  return GCurrentRoute
}

function routes__toRedirect() {
  return GCurrentRoute.redirect
}

function routes__redirect() {
  return GCurrentRoute.redirect
}

function routes__toInclude() {
  return GCurrentRoute.include
}

function routes__include() {
  return GCurrentRoute.include
}

function routes__toFlush() {
  return GCurrentRoute.flush
}

function routes__require() {
  return GCurrentRoute.require
}
