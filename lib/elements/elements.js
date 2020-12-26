function elements__overwrite(element, data) {
  var tempParent = __elements__createTempParent(element)
  tempParent.innerHTML = data
  var siblings = Array.prototype.slice.call(tempParent.childNodes)
  while(tempParent.childNodes.length) {
    element.parentNode.insertBefore(tempParent.childNodes[0], element)
  }
  elements__remove(element)
  return siblings
}

function elements__clone(element) {
  var emeta = emeta__get(element)
  if(!emeta || !emeta.$p) {
    consoleError('Setu.elements !', 'internal error while trying to eval binds',
      element)
    throw new Error(MSG_INTERNAL_ERROR)
  }
  var $p = emeta.$p,
    temp = elements__createTemp(element, $p.$t)
  element.parentNode.insertBefore(temp.childNodes[0], element)
  var sibling = element.previousSibling
  emparse__setupSibling(element, sibling)
  emparse__swapOriginRelWithSibling(element, emeta, sibling)
  if($p.$c) {
    emeta__get(sibling).$p.$c = $p.$c
  }
  elements__remove(element)
  console.info('Setu.elements + bind ||', element, sibling)
  return sibling
}

function elements__remove(element) {
  emeta__delete(element)
  if(document.body.contains(element)) {
    console.info('Setu.elements x', element)
    element.parentNode.removeChild(element)
  }
}

function elements__hide(element) {
  var $p = emeta__get(element).$p,
    comment = document.createComment(__elements__commentContent(element, $p)),
    emetaComment = emeta__new(comment)
  emetaComment.$p = $p
  element.parentNode.insertBefore(comment, element)
  elements__remove(element)
  console.debug('Setu.elements _', element, comment)
  return comment
}

function __elements__commentContent(element, $p) {
  return META_CONTENT + ':' + ehide__add($p.$t || element.outerHTML)
}

function elements__show(comment) {
  if(!comment || !document.body.contains(comment)) {
    console.debug('Setu.elements ignore dead comment', comment)
    return
  }
  var element = __elements__restore(comment),
    emetaComment = emeta__get(comment),
    $p = emetaComment.$p
  if($p.$i) {
    $p.$i.forEach(function(iter){
      elements__remove(iter)
    })
    delete $p.$i
  }
  var emeta = emeta__new(element)
  emeta.$p = $p
  emeta__delete(comment)
  comment.parentNode.removeChild(comment)
  console.info('Setu.elements $ re-birth', element, emeta.$p)
  return element
}

function elements__fromTemplate(element) {
  return __elements__fromText(element, elements__template(element))
}

function elements__template(element) {
  var emeta = emeta__get(element)
  if(!emeta || !emeta.$p || !emeta.$p.$t) {
    consoleError('Setu.elements ! template-to-node', element, emeta)
    throw new Error(MSG_INTERNAL_ERROR)
  }
  console.debug('Setu.elements template', emeta.$p.$t)
  return emeta.$p.$t
}

function elements__createTemp(node, data) {
  var temp = __elements__createTempParent(node)
  temp.innerHTML = data
  return temp
}

function __elements__restore(comment) {
  var idx = __elements__hideIdx(comment),
    restored = __elements__fromText(comment, ehide__get(idx))
  ehide__delete(idx)
  comment.parentNode.insertBefore(restored, comment)
  return restored
}

function __elements__hideIdx(comment) {
  return parseInt(comment.textContent.replace(/^.*:/g, ''), 10)
}

function elements__tempFromComment(comment) {
  return __elements__fromText(comment, ehide__get(__elements__hideIdx(comment)))
}

function __elements__fromText(node, text) {
  var tempParent = __elements__createTempParent(node)
  tempParent.innerHTML = text
  return tempParent.firstChild
}

function __elements__createTempParent(node) {
  var parentTagName = node.parentNode.tagName.toLowerCase()
  if('body' === parentTagName) {
    parentTagName = 'div'
  }
  return document.createElement(parentTagName)
}
