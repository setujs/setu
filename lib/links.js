function links__setup() {
  app__descendents('a[href]').forEach(function(link) {
    var emeta = emeta__new(link)
    if(emeta.$l) { // already setup
      return true
    }
    var path = link.getAttribute('href').replace(/\?.*$/, '')
    if(routes__getDef(path)) {
      $_(link).onclick(function(e) {
        utils__shuntEvent(e)
        console.info('Setu.application navigating', link.getAttribute('href'))
        app__open(link.getAttribute('href'))
        return false
      })
      console.debug('Setu.links $ link-setup', link)
    }
    emeta.$l = true
  })
}
