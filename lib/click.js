function click__setup(element, emeta) {
  if(emeta.$c) { // already setup
    return
  }
  var clickDetail = syn__parseClick(element)
  if(null === clickDetail) {
    consoleError('Setu.clicks ! invalid', META_CLICK,
      element.getAttribute(META_CLICK), element)
    throw new Error(MSG_INVALID_META)
  }
  __click__setupByType(clickDetail, element)
  emeta.$c = true
}

function __click__setupByType(clickDetail, element) {
  switch (clickDetail.type) {
  case KW_DELETE:
    $_(element).onclick(function(e){
      utils__shuntEvent(e)
      var context = emparse__findContext(element)
      if(!context) {
        consoleError('Setu.clicks ! cannot find context',
          element.getAttribute(META_CLICK), element)
        throw new Error(MSG_INVALID_META)
      }
      console.info('Setu.click @ delete', context)
      var callback = null, param = null
      if(element.hasAttribute(META_DELETE_CALLBACK)) {
        try {
          callback = eval(element.getAttribute(META_DELETE_CALLBACK))
        } catch(e) {
        }
      }
      if(element.hasAttribute(META_DELETE_PARAM)) {
        try {
          param = element.getAttribute(META_DELETE_PARAM)
          param = eval(param)
        } catch(e) {
        }
      }
      backend__deleteInstance(context, callback, param)
    })
    console.debug('Setu.clicks + click handler', clickDetail.type, element)
    break
  case KW_CODE:
    $_(element).onclick(function(e) {
      utils__shuntEvent(e)
      /* eslint-disable no-eval */
      eval(clickDetail.code)
      /* eslint-enable no-eval */
    })
    break
  }
}
