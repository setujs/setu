var GBound = {},
  GParsingBinds = false,
  GBindQueue = [],
  GBindProcessingCookie = '__gbpc__',
  GProcessingBinds = false

events__register(ns.EVENT_LIST_RESOURCE_CREATE, function(ignored, resource){
  __binds__event({
    handler: __binds__onListCreate,
    resource: resource
  })
}, GBindProcessingCookie)

function binds__clear() {
  GBound = {}
  GParsingBinds = false
  GBindQueue = []
  GProcessingBinds = false
  console.info('Setu.binds x')
}

function binds__register(element, emeta) {
  __binds__registerResources(syn__parseBind(element))
  console.debug('Setu.binds $ +', element, emeta)
}

function __binds__registerResources(binds) {
  binds.forEach(function(resource) {
    binds__doIfNotYetDone(resource)
  })
}

function binds__doIfNotYetDone(resource) {
  var key = resource.key
  if(!(key in GBound)) {
    __binds__register(key, resource.type)
    GBound[key] = true
  }
}

function __binds__register(key, type) {
  if(KW_DETAIL === type) {
    events__registerFrom(ns.EVENT_DETAIL_RESOURCE_CHANGE, key,
      function(ignored, resource, data) {
        __binds__event({
          handler: __binds__onDetailChange,
          resource: resource,
          data: data,
        })
      }, GBindProcessingCookie
    )
    events__registerFrom(ns.EVENT_DETAIL_RESOURCE_DELETE, key,
      function(ignored, resource) {
        __binds__event({
          handler: __binds__onDetailDelete,
          resource: resource,
        })
      }, GBindProcessingCookie)
  } else if(KW_LIST === type) {
    events__registerFrom(ns.EVENT_LIST_RESOURCE_CHANGE, key,
      function(ignored, resource) {
        __binds__event({
          handler: __binds__onListChange,
          resource: resource,
        })
      }, GBindProcessingCookie)
    events__registerFrom(ns.EVENT_LIST_RESOURCE_DELETE, key,
      function(ignored, resource) {
        __binds__event({
          handler: __binds__onListDelete,
          resource: resource,
        })
      }, GBindProcessingCookie)
  }
  console.info('Setu.binds $', key, type)
}

function __binds__event(handler) {
  GBindQueue.push(handler)
  __binds__process()
}

function __binds__process(force) {
  if(!GProcessingBinds) {
    GProcessingBinds = true
  } else if(!force) {
    console.info('Setu.binds @ another bind is being processed')
    return
  }
  while(GBindQueue.length) {
    var handler = GBindQueue.shift()
    handler.handler(undefined, handler.resource, handler.data)
    if(!parser__isDone()) {
      // the bind processing created few async items, so need
      // to wait till meta render
      console.info('Setu.binds $ parser !$')
      events__register(ns.EVENT_META_RENDER, function(){
        __binds__process(true)
      }, GBindProcessingCookie)
      console.info('Setu.binds _ will resume post meta render')
      return
    }
  }
  GProcessingBinds = false
  events__unregister(ns.EVENT_META_RENDER, GBindProcessingCookie)
  console.info('Setu.binds $ queue empty')
}

function __binds__onDetailChange(ignored, resource, data) {
  console.info('Setu.binds @ detail-change', resource, data)
  var key = resource.key,
    toEval = __binds__resEffected(key),
    evaled = __binds__clone(toEval)
  for(var field in data) {
    if(data.hasOwnProperty(field)){
      Array.prototype.push.apply(evaled, __binds__showResEffected(key))
    }
  }
  __binds__parse(evaled)
  console.info('Setu.binds $ detail-change', resource, data)
}

function __binds__onDetailDelete(ignored, resource) {
  console.info('Setu.binds @ detail-delete', resource)
  __binds__removeResEffected(resource.key)
  console.info('Setu.binds $ detail-delete', resource)
}

function __binds__onListCreate(ignored, resource) {
  console.info('Setu.binds @ list-create', resource)
  __binds__processResEffected(resource)
  console.info('Setu.binds $ list-create', resource)
}

function __binds__onListChange(ignored, resource) {
  console.info('Setu.binds @ list-change', resource)
  __binds__processResEffected(resource)
  console.info('Setu.binds $ list-change', resource)
}

function __binds__onListDelete(ignores, resource) {
  console.info('Setu.binds @ list-delete', resource)
  __binds__removeResEffected(resource.key)
  console.info('Setu.binds $ list-delete', resource)
}

function __binds__removeResEffected(key) {
  var elements = __binds__resEffected(key)
  elements.forEach(function(element) {
    elements__remove(element)
  })
  console.info('Setu.parser $ remove-bound', key, elements)
}

function __binds__processResEffected(resource) {
  var key = resource.key
  var toEval = __binds__resEffected(key),
    evaled = __binds__clone(toEval)
  Array.prototype.push.apply(evaled, __binds__showResEffected(key))
  __binds__parse(evaled)
}

function __binds__resEffected(key) {
  var potentials = app__descendents('[' + META_BIND + ']'),
    elements = []
  potentials.forEach(function(element) {
    if(syn__hasBindKey(element, key)) {
      var emeta = emeta__get(element)
      console.info('Setu.binds @ bound', key, element, emeta.$p, emeta.$p.$t)
      elements.push(element)
    }
  })
  return elements
}

function __binds__clone(elements) {
  var clones = []
  observer__stop()
  elements.forEach(function(element) {
    if(document.body.contains(element)) {
      console.debug('Setu.binds @ re-eval', element, emeta__get(element))
      clones.push(elements__clone(element))
    }
  })
  observer__monitor(GAppElement)
  return clones
}

function __binds__showResEffected(key) {
  var elements = [],
    hidden = []
  observer__stop()
  hidden__all().forEach(function(comment) {
    if(!document.body.contains(comment)) {
      console.debug('Setu.parser @ unhide x comment', comment)
      return
    }
    if(syn__hasBindKey(elements__tempFromComment(comment), key)) {
      elements.push(elements__show(comment))
    } else {
      hidden.push(comment)
    }
  })
  hidden__replace(hidden)
  observer__monitor(GAppElement)
  console.info('Setu.parser $ unhide', key, hidden, elements)
  return elements
}

function __binds__parse(evaled) {
  GParsingBinds = true
  evaled.forEach(function(element){
    parser__parseElement(element)
  })
  GParsingBinds = false
  parser__$()
}

function binds__parsing() {
  return GParsingBinds
}
