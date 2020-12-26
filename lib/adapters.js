var GAdapters = {}

function adapters__register(purpose, procedure, context) {
  GAdapters[purpose] = GAdapters[purpose] || []
  GAdapters[purpose].push([context, procedure])
  console.debug('Setu.adapters +', purpose, context, procedure)
}

function adapters__run(purpose) {
  if(!GAdapters[purpose]) {
    return []
  }
  /**
   * It's called as follows:
   * adapters__run(purpose, arg0, arg1, arg2, ...)
   *
   * The 'arguments' var is sliced into an array and 0th
   * item is replaced with the context of each registry.
   * The registered adapter procedure is called as follows:
   * procedure(context, arg0, arg1, arg2, ...)
  */
  var args = Array.prototype.slice.apply(arguments),
    results = []
  GAdapters[purpose].forEach(function(registry) {
    args[0] = registry[0]
    results.push(registry[1].apply(null, args))
  })
  console.info('Setu.adapters >', purpose, results)
  return results
}

/* The global adapters registry */
ns.adapters = {}
