function syn__existsIn(element) {
  return (syn__hasAttrs(element) ||
    syn__hasTemplates(element) ||
    __syn__hasSynChildren(element))
}

function __syn__hasSynChildren(element) {
  return 0 != syn__childrenCount(element)
}

function syn__childrenCount(element) {
  return element.querySelectorAll(META_ATTRS_SELECTOR).length
}

function syn__hasTemplates(element) {
  return syn__isTemplate(element.outerHTML)
}

function syn__isTemplate(text) {
  return text.match(REGEX_TEMPLATE) || text.match(REGEX_TRUTHY_TEMPLATE)
}

function syn__hasAttrs(element) {
  for(var idx = 0; idx < META_ATTRIBUTES.length; ++idx) {
    if(element.hasAttribute(META_ATTRIBUTES[idx])) {
      return true
    }
  }
  return false
}

function syn__parseClick(element) {
  var str = element.getAttribute(META_CLICK), parsed
  if(!str) {
    return null
  }
  var match
  if(KW_DELETE === str) {
    return {type: str}
  }
  else {
    return {type: KW_CODE, code: str}
  }
}

function syn__parseFormEntity(form) {
  if(form.hasAttribute(META_MODEL)) {
    return {
      type: KW_MODEL,
      model: models__get(form.getAttribute(META_MODEL))
    }
  } else if(form.hasAttribute(META_INSTANCE)) {
    var resourceKey = form.getAttribute(META_INSTANCE)
    var resource = res__parseKey(emeta__get(form).$p.$n, resourceKey)
    if(KW_DETAIL !== resource.type) {
      consoleError('Setu.meta !', 'invalid instance resource key', resourceKey, form)
      throw new TypeError(MSG_INVALID_META)
    }
    return {
      type: KW_INSTANCE,
      resource: resource
    }
  }
  return null
}

function syn__parseBind(element) {
  return syn__parseResList(element, META_BIND)
}

function syn__parseRequire(element) {
  return syn__parseResList(element, META_REQUIRE)
}

var __resTypes = [KW_LIST, KW_DETAIL, KW_API]

function syn__parseResList(element, attrib) {
  if(!element.hasAttribute(attrib)) {
    return []
  }
  var array = element.getAttribute(attrib).split(',')
  for(var i = 0; i < array.length; ++i) {
    if(!emeta__get(element)) {
      consoleError('Setu.meta !', 'element not init before parsing res list', element)
    }
    var resource = res__parseKey(emeta__get(element).$p.$n, array[i])
    if(!__resTypes.contains(resource.type)) {
      consoleError('Setu.meta !', 'invalid key', attrib, array[i], element)
      throw new TypeError(MSG_INVALID_META)
    }
    array[i] = resource
  }
  console.debug('Setu.meta keys -> resources', attrib, element, array)
  return array
}

function syn__hasBindKey(node, key) {
  if(node.hasAttribute(META_BIND)) {
    var keyRegex = new RegExp('[,]?' + __syn__regexFix(key) + '[,]?')
    return !!node.getAttribute(META_BIND).match(keyRegex)
  }
  return false
}

function __syn__regexFix(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}
