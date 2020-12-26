var GHiddenTemplates = {},
  GHiddenTemplateCounter = 0

function ehide__clear() {
  GHiddenTemplates = {}
  GHiddenTemplateCounter = 0
}

function ehide__add(content) {
  var idx = GHiddenTemplateCounter++
  GHiddenTemplates[idx] = content
  return idx
}

function ehide__get(idx) {
  return GHiddenTemplates[idx]
}

function ehide__delete(idx) {
  delete GHiddenTemplates[idx]
}
