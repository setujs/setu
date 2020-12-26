var GConfig

function config__setup(config) {
  GConfig = config
  if(GConfig.logLevel) {
    log__setLevel(GConfig.logLevel)
  }
  if(GConfig.adapters) {
    GConfig.adapters.forEach(function(adapterGroup) {
      ns.adapters[adapterGroup].forEach(function (adapter) {
        adapters__register(adapter.purpose, adapter.handler)
      })
    })
  }
  console.debug('Setu.config $ setup')
}

function config__pathChangeFlush() {
  if(GConfig.pathchange && GConfig.pathchange.flush) {
    return GConfig.pathchange.flush
  }
  return undefined
}
