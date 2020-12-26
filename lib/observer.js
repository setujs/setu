var GObserverRunning = false

var GObserver = new MutationObserver(function(mutations) {
  __observer__process(mutations)
})

function observer__monitor(element) {
  if(element && document.body.contains(element)) {
    GObserver.observe(element, {
      childList: true,
      subtree: true
    })
  }
}

function observer__stop() {
  GObserver.disconnect()
}

function __observer__process(mutations) {
  GObserverRunning = false
  mutations.forEach(function(m) {
    if(m.addedNodes) {
      m.addedNodes.forEach(function(node) {
        if(NODE_TYPE_ELEMENT === node.nodeType && document.body.contains(node) && syn__existsIn(node)) {
          GObserverRunning = true
          console.debug('Setu.observer +', node)
          parser__parseElement(node)
        }
      })
    }
  })
  if(observer__running()) {
    if(parser__isDone()) {
      parser__endgame()
    }
    GObserverRunning = false
  }
}

function observer__running() {
  return GObserverRunning
}
