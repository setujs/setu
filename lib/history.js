var GHistoryChange, GLast

window.onpopstate = function(e) {
  if(e.state && e.state.pathname) {
    if(!__history__onlyFragmentChange(e.state, GLastUrl || {})) {
      GHistoryChange = e.state
      console.info('Setu.history popstate', e.state, GLastUrl)
      app__navigate()
    } else {
      events__fire(ns.EVENT_FRAGMENT_CHANGE, ns)
    }
    __history__rememberLastUrl()
  }
}

function __history__onlyFragmentChange(path1, path2) {
  return path1.pathname === path2.pathname && path1.search === path2.search
}

function __history__parsePath(path) {
  var fragment = path.match(/#/) ? path.replace(/^.*#/g, '#') : "",
    fragmentLess = fragment ? path.replace(/#.*$/g, '') : path,
    search = fragmentLess.match(/\?/) ? fragmentLess.replace(/^.*\?/g, '?') : "",
    pathname = search ? fragmentLess.replace(/\?.*$/g, '') : fragmentLess
  return {pathname: pathname, search: search, fragment: fragment}
}

function history__addFragment(fragment) {
  history__push(window.location.pathname + window.location.search + '#' + fragment, {
    pathname: window.location.pathname,
    search: window.location.search,
    fragment: '#' + fragment
  })
  console.info('Setu.history #', fragment)
}

function history__push(path, parsedPath) {
  parsedPath = parsedPath || __history__parsePath(path)
  window.history.pushState(parsedPath, '', path)
  __history__rememberLastUrl()
  console.info('Setu.history push', parsedPath)
}

function history__replace(path) {
  var parsedPath = __history__parsePath(path)
  window.history.replaceState(parsedPath, '', path)
  __history__rememberLastUrl()
  console.info('Setu.history replace', parsedPath)
}

function history__changedPath() {
  return GHistoryChange && GHistoryChange.pathname ? GHistoryChange.pathname : null
}

function history__eraseChange() {
  GHistoryChange = null
}

function __history__rememberLastUrl() {
  GLastUrl = {
    pathname: window.location.pathname,
    search: window.location.search,
    fragment: window.location.hash
  }
}

history__push(window.location.pathname + window.location.search + window.location.hash, {
  pathname: window.location.pathname,
  search: window.location.search,
  fragment: window.location.hash
})

ns.fragment = history__addFragment
