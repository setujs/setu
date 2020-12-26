function emparse__init(element) {
  var emeta = emeta__new(element)
  __emparse__init(emeta)
  if(!Object.keys(emeta.$p.$n).length) {
    var par = element.parentNode
    while(par && !app__isAppRoot(par)) {
      var emetaParent = emeta__get(par)
      if(emetaParent && emetaParent.$p && emetaParent.$p.$n) {
        __emparse__copyNeeded(emetaParent, emeta)
        return
      }
      par = par.parentNode
    }
  }
  return emeta
}

function emparse__setupLoopElement(element, sibling, key, iterator) {
  emparse__setupSibling(element, sibling)
  var emeta = emeta__get(sibling)
  emeta.$p.$c = {}
  emeta.$p.$c[key] = iterator
  emeta.$p.$n[key] = iterator
  emeta.$p.$l = true
}

function emparse__setupSibling(element, sibling) {
  var emetaSibling = emeta__new(sibling),
    emeta = emeta__get(element)
  __emparse__init(emetaSibling)
  __emparse__copyNeeded(emeta, emetaSibling)
  __emparse__copyOthers(emeta, emetaSibling)
}

function emparse__swapOriginRelWithSibling(element, emeta, sibling) {
  if(emeta.$p.$o) {
    var origin = emeta.$p.$o,
      emetaOrigin = emeta__get(origin),
      emetaSibling = emeta__get(sibling)
    emetaOrigin.$p.$i.remove(element)
    emetaOrigin.$p.$i.push(sibling)
    emetaSibling.$p.$o = origin
  }
}

function emparse__unlatchLoopOrigin(element, emeta) {
  var origin = emeta.$p.$o
  if(origin) {
    var emetaOrigin = emeta__get(origin)
    emetaOrigin.$p.$i.remove(element)
  }
  delete emeta.$p.$o
}

function emparse__findContext(element) {
  while(element && !app__isAppRoot(element)) {
    var emeta = emeta__get(element)
    if(emeta.$p && emeta.$p.$c) {
      for(var key in emeta.$p.$c) {
        console.debug('Setu.emparse context', key, emeta.$p.$c[key])
        return emeta.$p.$c[key]
      }
    }
    if('form' === element.tagName.toLowerCase() &&
        element.hasAttribute(META_INSTANCE))
    {
      var res = res__getByKey(element.getAttribute(META_INSTANCE))
      if(res) {
        return res.value
      }
    }
    element = element.parentNode
  }
  return null
}

function __emparse__init(emeta) {
  emeta.$p = emeta.$p || {}
  emeta.$p.$n = emeta.$p.$n || {}
}

function __emparse__copyNeeded(emetaFrom, emetaTo) {
  for(var key in emetaFrom.$p.$n) {
    emetaTo.$p.$n[key] = emetaFrom.$p.$n[key]
  }
}

function __emparse__copyOthers(emetaFrom, emetaTo) {
  var $n = emetaFrom.$p.$n
  delete emetaFrom.$p.$n
  for(var key in emetaFrom.$p) {
    emetaTo.$p[key] = emetaFrom.$p[key]
  }
  emetaFrom.$p.$n = $n
}
