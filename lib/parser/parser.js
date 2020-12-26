var GParsingCount = 0,
  GPageDone = false,
  GIncludes = {}

function parser__clear() {
  hidden__clear()
  ehide__clear()
  GParsingCount = 0
  GPageDone = false
  console.debug('Setu.parser x')
}

function parser__isDone() {
  console.debug('Setu.parser ✓', (0 === GParsingCount))
  return 0 === GParsingCount
}

function parser__endgame() {
  links__setup()
  listmodifiers__setupFilters()
  events__fire(ns.EVENT_META_RENDER, ns)
  if(!GPageDone) {
    GPageDone = true
    events__fire(ns.EVENT_PAGE_RENDER, ns)
    if(!sse__isSetup() && GModelsConfig && GModelsConfig.instanceEventStream) {
      sse__setup(GModelsConfig.instanceEventStream)
    }
  }
}

function __parser__markParsing(element) {
  if(ns.appOnParseBegin) {
    ns.appOnParseBegin('setu')
  }
  ++GParsingCount
  console.debug('Setu.parser @', element, '#parsing', GParsingCount)
}

function __parser__markDoneParsing(element) {
  --GParsingCount
  if(ns.appOnParseEnd) {
    ns.appOnParseEnd()
  }
  console.debug('Setu.parser $', element, '#parsing', GParsingCount)
  parser__$()
}

function parser__$() {
  if(!observer__running() && !binds__parsing() && parser__isDone()) {
    parser__endgame()
  }
}

function parser__parseElement(element, resuming) {
  if(!document.body.contains(element)) {
    return
  }
  if(!resuming) {
    __parser__markParsing(element)
  }
  emparse__init(element)
  var emeta = emeta__get(element)
  switch(__parser__parseElement(element, emeta.$p, emeta.$p.$n)) {
    case PARSE_ERROR:
    case PARSE_PENDING:
      return
    case PARSE_REMOVED:
    case PARSE_REPLACED:
      break
    case PARSE_DONE:
      __parser__postParseElement(element, emeta)
      console.debug('Setu.parser $ parse', element, emeta.$p)
      break
  }
  __parser__markDoneParsing(element)
}

/* eslint-disable complexity */
function __parser__parseElement(element, $p, needed) {
  if(syn__hasTemplates(element)) {
    __parser__evalAttrs(element, needed)
  }
  if(element.hasAttribute(META_INCLUDE)) {
    console.info('Setu.parser @ _', META_INCLUDE, element, $p)
    var url = element.getAttribute(META_INCLUDE).trim()
    if(GIncludes[url]) {
      var idx = $_(element).index(),
        par = element.parentNode,
        targets = __parser__processInclude(element, $p, needed, GIncludes[url])
      if(!document.body.contains(element)) {
        __parser__parseReplaced(par, targets, needed)
        return PARSE_REPLACED
      }
    } else {
      http__get(element.getAttribute(META_INCLUDE).trim(), {}, function(response) {
        GIncludes[url] = response.data
        var idx = $_(element).index(),
          par = element.parentNode,
          targets = __parser__processInclude(element, $p, needed, response.data)
        if(!document.body.contains(element)) {
          __parser__parseReplaced(par, targets, needed)
          __parser__markDoneParsing(element)
        } else {
          parser__parseElement(element, true)
        }
      }, function(e) {
        var err = JSON.parse(e.message)
        events__fire(ns.EVENT_AJAX_ERROR, null, {status: err.status, error: err.error})
      })
      return PARSE_PENDING
    }
  }
  if(element.hasAttribute(META_REQUIRE)) {
    var required = syn__parseRequire(element), resources
    if(!(resources = res__ifAvailable(required))) {
      __parser__require(element, $p, needed, required)
      return PARSE_PENDING
    }
    for(var key in resources) {
      needed[key] = resources[key]
    }
    console.info('Setu.parser $', META_REQUIRE, element, resources, needed)
  }
  if(element.hasAttribute(META_BIND) && !$p.$t && !element.hasAttribute(META_LOOP)) {
    var bindAttr = element.getAttribute(META_BIND)
    if(syn__isTemplate(bindAttr)) {
      element.setAttribute(META_BIND, evals__doTemplate(needed, bindAttr))
    }
    $p.$t = element.outerHTML
    console.info('Setu.parser $', META_BIND, element, $p.$t)
  }
  if(element.hasAttribute(META_LOOP)) {
    var match
    if(null === (match = element.getAttribute(META_LOOP).trim().match(REGEX_LOOP))) {
      return PARSE_ERROR
    }
    var key = match[1],
      arrayName = match[2],
      array
    try {
      array = evals__doExpr(needed, arrayName)
    } catch(e) {
      consoleError('Setu.parser !', META_LOOP, match[2], element, $p, e.message, e.stack)
      return PARSE_ERROR
    }
    if(!array) {
      consoleError('Setu.parser !', META_LOOP, match[2], element, $p, array)
      return PARSE_ERROR
    }
    needed[arrayName] = array
    var copies = __parser__createLoopElements(element, $p, key, array),
      comment = elements__hide(element)
    __parser__setLoopElementsOrigin(comment, copies)
    hidden__add(comment)
    console.info('Setu.parser $', META_LOOP, element, $p)
    copies.slice().forEach(function(copy){
      parser__parseElement(copy)
    })
    return PARSE_REMOVED
  }
  if(element.hasAttribute(META_IF)) {
    var expr = element.getAttribute(META_IF).trim(), condition = false
    try {
      condition = evals__doExpr(needed, expr)
    } catch (e) {
      consoleError('Setu.parser !', META_IF, expr, element, $p, e.message, e.stack)
      return PARSE_ERROR
    }
    if(!condition) {
      if(!$p.$l) {
        console.info('Setu.parser _', META_IF, element, $p)
        if(element.hasAttribute(META_BIND)) {
          binds__register(element)
        }
        hidden__add(elements__hide(element))
      } else {
        console.info('Setu.parser x', META_IF, element, $p)
        emparse__unlatchLoopOrigin(element, emeta__get(element))
        elements__remove(element)
      }
      return PARSE_REMOVED
    }
    console.info('Setu.parser $', META_IF, element, $p)
  }
  if(element.hasAttribute(META_DECLARE)) {
    var declares = element.getAttribute(META_DECLARE).split(';')
    for(var idx = 0; idx < declares.length; ++idx) {
      var match
      if(null === (match = declares[idx].trim().match(REGEX_DECLARE))) {
        return PARSE_ERROR
      }
    }
    for(var idx = 0; idx < declares.length; ++idx) {
      var match = declares[idx].trim().match(REGEX_DECLARE),
        name = match[1],
        rval = match[2]
      try {
        rval = evals__doExpr(needed, rval)
        needed[name] = rval
      } catch (e) {
        consoleError('Setu.parser !', META_DECLARE, name, match[2], element, $p, e.message, e.stack)
        return PARSE_ERROR
      }
    }
    console.info('Setu.parser $', META_DECLARE, element, declares, needed)
  }
  if(syn__hasTemplates(element)) {
    __parser__evalAttrs(element, needed)
    if(syn__isTemplate(element.innerHTML)) {
      var children = Array.prototype.slice.call(element.childNodes)
      children.forEach(function(child){
        if(NODE_TYPE_TEXT === child.nodeType && syn__isTemplate(child.textContent)) {
          __parser__parseText(child, element, needed)
        }
      })
    }
    console.info('Setu.parser $ {{}}', element, $p)
  }
  __parser__parseChildren(element)
  return PARSE_DONE
}
/* eslint-enable complexity */

function __parser__evalAttrs(element, needed) {
  for(var idx = 0; idx < element.attributes.length; ++idx) {
    var attr = element.attributes[idx]
    if(syn__isTemplate(attr.value)) {
      attr.value = evals__doTemplate(needed, attr.value)
    }
  }
}

function __parser__processInclude(element, $p, needed, html) {
  var targets
  observer__stop()
  if(element.hasAttribute(META_REPLACE)) {
    targets = __parser__replace(element, $p, needed, html)
  } else {
    __parser__include(element, $p, needed, html)
  }
  observer__monitor(GAppElement)
  return targets
}

function __parser__replace(element, $p, needed, html) {
  var siblings = elements__overwrite(element, html)
  console.info('Setu.parser $', META_INCLUDE, element, $p)
  return siblings
}

function __parser__include(element, $p, needed, html) {
  element.innerHTML = html
  element.removeAttribute(META_INCLUDE)
  console.info('Setu.parser $', META_INCLUDE, element, $p)
}

function __parser__parseReplaced(par, nodes, needed) {
  nodes.forEach(function(node){
    if(NODE_TYPE_ELEMENT === node.nodeType) {
      parser__parseElement(node)
    }
    else if(NODE_TYPE_TEXT === node.nodeType && syn__isTemplate(node.textContent)) {
      __parser__parseText(node, par, needed)
    }
  })
}

function __parser__require(element, $p, needed, required) {
  console.info('Setu.parser @ _', META_REQUIRE, element, $p)
  res__get(required, {}, function(resources) {
    for(var key in resources) {
      needed[key] = resources[key]
    }
    console.info('Setu.parser $', META_REQUIRE, element, resources, needed)
    parser__parseElement(element, true)
  })
}

function __parser__createLoopElements(element, $p, key, array) {
  observer__stop()
  var html = __parser__getCopiesHtml(element, array),
    numElements = array.length,
    temp = elements__createTemp(element, html),
    copies = Array.prototype.slice.call(temp.childNodes)
  for(idx = 0; idx < numElements; ++idx) {
    var iterator = array[idx],
      sibling = temp.childNodes[0]
    emparse__setupLoopElement(element, sibling, key, iterator)
    element.parentNode.insertBefore(sibling, element)
    console.info('Setu.parser +', META_LOOP, sibling, emeta__get(sibling).$p, key, iterator, element, $p)
  }
  observer__monitor(GAppElement)
  return copies
}

function __parser__getCopiesHtml(element, array) {
  var loopAttr = element.getAttribute(META_LOOP),
    idx
  element.removeAttribute(META_LOOP)
  var html = '',
    numElements = array.length
  for(idx = 0; idx < numElements; ++idx) {
    html += element.outerHTML
  }
  element.setAttribute(META_LOOP, loopAttr)
  return html
}

function __parser__setLoopElementsOrigin(origin, elements) {
  var emetaOrigin = emeta__get(origin)
  emetaOrigin.$p.$i = elements
  elements.forEach(function(element) {
    var emeta = emeta__get(element)
    emeta.$p.$o = origin
  })
}

function __parser__parseText(text, par, needed) {
  var evaledText = evals__doTemplate(needed, text.textContent.trim()).trim(),
    div = document.createElement('div')
  div.innerHTML = evaledText
  while(div.childNodes.length) {
    par.insertBefore(div.childNodes[0], text)
  }
  par.removeChild(text)
}

function __parser__parseChildren(element) {
  var children = Array.prototype.slice.call(element.childNodes)
  children.forEach(function(child){
    if(child.nodeType === NODE_TYPE_ELEMENT && syn__existsIn(child)) {
      parser__parseElement(child)
    }
  })
}

function __parser__postParseElement(element, emeta) {
  if(element.hasAttribute(META_CLICK)) {
    click__setup(element, emeta)
  }
  if(element.hasAttribute(META_PAGESIZE)) {
    listmodifiers__setupListPageSize(element)
  }
  else if(element.hasAttribute(META_PAGESET)) {
    listmodifiers__setupListPageSet(element)
  }
  else if(element.hasAttribute(META_FILTER)) {
    listmodifiers__setupListFilter(element)
  }
  if('form' === element.tagName.toLowerCase()) {
    forms__setup(element, emeta)
  }
  else if('select' === element.tagName.toLowerCase()) {
    forms__fixSelect(element)
  }
  else if('option' === element.tagName.toLowerCase()) {
    var select = element.parentNode
    while(select && 'select' !== select.tagName.toLowerCase()) {
      select = select.parentNode
    }
    if(select && !$_(element).next()) {
      forms__fixSelect(select)
    }
  }
  if(element.hasAttribute(META_BIND)) {
    binds__register(element, emeta)
  }
}
