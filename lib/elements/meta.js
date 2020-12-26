var GScopeMeta = {},
  GScopeMetaCounter = 0

function emeta__new(element) {
  if(!(ELEM_META_ATTR in element)) {
    ++GScopeMetaCounter
    element[ELEM_META_ATTR] = GScopeMetaCounter
    GScopeMeta[element[ELEM_META_ATTR]] = {}
  }
  return emeta__get(element)
}

function emeta__get(element) {
  return GScopeMeta[element[ELEM_META_ATTR]]
}

function emeta__delete(element) {
  if(__emeta__exists(element)) {
    delete GScopeMeta[element[ELEM_META_ATTR]]
    delete element[ELEM_META_ATTR]
  }
}

function __emeta__exists(element) {
  return ELEM_META_ATTR in element
}
