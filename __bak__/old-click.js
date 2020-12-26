var GClicks

function setupClicks(clicks) {
  GClicks = clicks
}

function click__setup(element) {
  if(element.$sClick) { // already setup
    return
  }
  var clickDetail = syn__parseClick(element)
  if(null === clickDetail) {
    consoleError('Setu.clicks ! invalid setu-click',
      element.getAttribute(META_CLICK), element)
    throw new Error(MSG_INVALID_META)
  }
  __click__setupByType(clickDetail, element)
  element.$sClick = true
}


function __click__setupByType(clickDetail, element) {
  switch (clickDetail.type) {
  case KW_DETAIL:
  case KW_UPDATE:
  case KW_DELETE:
    setupInstanceClickAction(element, clickDetail)
    console.debug('Setu.clicks + click handler', clickDetail.type, element)
    break
  case KW_CREATE:
  case KW_LIST:
    setupModelClickAction(element, clickDetail)
    console.debug('Setu.clicks + click handler', clickDetail.type, element)
    break
  case 'generic':
    element.onclick = function(e) {
      utils__shuntEvent(e)
      /* eslint-disable no-eval */
      eval(clickDetail.code)
      /* eslint-enable no-eval */
    }
    break
  }
}

function setupInstanceClickAction(element, clickDetail) {
  var setu = element.$s
  if(!setu) {
    consoleError(
      'Setu.clicks ! internal programming error blocked processing setu-click',
      element)
    return
  }
  var context = ensureContextForClickableInstance(setu, element),
    modelName = context.$$m.name
  switch(clickDetail.type) {
  case KW_DETAIL:
  case KW_UPDATE:
    if(GClicks[modelName] && GClicks[modelName][clickDetail.type]) {
      var userFn = setupClickActionUserFn(element, modelName, clickDetail)
      clickDetail.instance = context
      setupClickActionHandler(element, clickDetail, userFn)
    }
    break
  case KW_DELETE:
    setupClickActionHandler(element, context, instances__delete)
    break
  }
}

function ensureContextForClickableInstance(setu, element) {
  var context = setu.needed[setu.contextKey]
  if(!context) {
    consoleError(
      'Setu.clicks ! setu-click specified on an element for',
      'which no instance context can be found',
      element)
    throw new Error(MSG_INVALID_META)
  }
  return context
}

function setupModelClickAction(element, clickDetail) {
  var modelName = clickDetail.modelName
  if(GClicks[modelName] && GClicks[modelName][clickDetail.type]) {
    var userFn = setupClickActionUserFn(element, modelName, clickDetail)
    setupClickActionHandler(element, clickDetail, userFn)
  }
}

function setupClickActionUserFn(element, modelName, clickDetail) {
  var userFn = GClicks[modelName][clickDetail.type]
  if('function' !== typeof (userFn)) {
    consoleError('Setu.clicks ! not a view function', modelName, clickDetail.type,
      userFn)
    throw new Error(MSG_BADLY_CONFIGURED)
  }
  clickDetail.passed = element.getAttribute(META_PASS)
  clickDetail.origin = element
  return userFn
}

function setupClickActionHandler(element, cookie, userFn) {
  $_(element).onclick(function(e) {
    utils__shuntEvent(e)
    userFn(cookie)
  })
}
