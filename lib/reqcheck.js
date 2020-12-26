if('function' !== typeof(document.querySelector)) {
  consoleError('Setu.env ! document.querySelector not supported')
  throw new Error(MSG_NO_SUPPORT)
}

if('function' !== typeof(document.querySelectorAll)) {
  consoleError('Setu.env ! document.querySelectorAll not supported')
  throw new Error(MSG_NO_SUPPORT)
}

if(!window.history ||
  'function' === typeof(!window.history.pushState) ||
  'function' === typeof(!window.history.popState))
{
  consoleError('Setu.env ! no support for browsing history update')
  throw new Error(MSG_NO_SUPPORT)
}

var MutationObserver = window.MutationObserver ||
  window.WebKitMutationObserver ||
  window.MozMutationObserver

if(!MutationObserver) {
  consoleError('Setu.env ! no MutationObserver support in browser')
  throw new Error(MSG_NO_SUPPORT)
}

if('function' !== typeof(Object.create)) {
  consoleError('Setu.env ! Object.create not supported')
  throw new Error(MSG_NO_SUPPORT)
}
