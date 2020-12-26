var GResources,
  GResourcesDefs

function res__setup(defs) {
  GResourcesDefs = defs
  GResources = {}
  console.debug('Setu.resources $ setup')
}

function res__ifAvailable(which) {
  /**
   * Check if *all* resources as specified by 'which' param
   * exist in the registry. If so, return the title:value
   * pairs corresponding to all of them. If even one of these
   * resources is not available ('value' attrib not set), then
   * return false.
   * All elements in the 'which' array are expected to be the
   * resource objects, and not strings. The point of this design
   * is to be specific to the usage of such a function, because
   * it's never called generically; but always in cases where the
   * resource objects are already accessible, so it avoids adding
   * the load of dissecting the resource keys by refusing to
   * entertain or expect resource key strings inside 'which'.
  */
  if(!which || !which.length) {
    return false
  }
  var resources = {}
  which.every(function(res) {
    var title = res.title,
      resource
    if((resource = GResources[res.key]) && resource.value) {
      resources[title] = resource.value
      return true
    } else {
      resources = false
      return false
    }
  })
  return resources
}

function res__get(which, needed, onsuccess) {
  if(!which || !which.length) {
    onsuccess({})
    return
  }
  var results = {}
  which.forEach(function(res) {
    var resource = 'string' === typeof (res) ?
      res__parseKey(needed, res) :
      res
    resource = __res__getOrSet(resource)
    __res__fetchOrGet(resource, function(result) {
      results[result.title] = result.value
      if(Object.keys(results).length === which.length) {
        /**
         * Since there could be a fetch from backend involved
         * for at least 1 of the resources, this is the right
         * place to check if we have got all required resources
        */
        console.info('Setu.resources {}', results)
        onsuccess(results)
      }
    })
  })
}

function res__parseKey(needed, key) {
  var def = GResourcesDefs[key]
  if(def) {
    return __res__buildApi(key, def)
  }
  return __res__parseKey(needed, key)
}

function __res__buildApi(key, def) {
  return {
    type: KW_API,
    key: key,
    title: key,
    api: def
  }
}

function __res__parseKey(needed, key) {
  var resource = {}, saveKey = key
  key = __res__evalKeyTemplates(key, needed)
  var match = __res__keyTemplateRegexMatch(key, saveKey)
  resource.key = __res__regexMatchToKey(match)
  var model = models__get_silent(match[3]), // match[3] -> model OR
    url = GResourcesDefs[match[3]] // match[3] -> api resource name
  if(!model && !url) {
    consoleError('Setu.resources ! invalid resource key', saveKey, key)
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
  res__regexMatchToParams(match, resource)
  if(model) {
    resource.model = model
    __res__regexMatchToPk(match, resource)
    resource.title = match[2] || // match[2] -> title
      __res__genericTitle(resource)
  } else { // url
    resource.api = url
    resource.title = match[2] || // match[2] -> title
      resource.key
    resource.type = KW_API
  }
  console.debug('Setu.resources $ parsed', saveKey, key, resource)
  return resource
}

function __res__evalKeyTemplates(key, needed) {
  if(syn__isTemplate(key)) {
    try {
      key = evals__doTemplate(needed, key)
    } catch (e) {
      /**
       * Any template eval or other related exceptions are ignored
       * for continuity and to eventually provide visual clue to
       * developer by showing unrendered templates
      */
      console.debug('Setu.resources ! key template', key, e.message, e.stack)
    }
  }
  return key
}

function __res__keyTemplateRegexMatch(key, saveKey) {
  var match = key.match(REGEX_RESOURCE)
  if(!match || 12 !== match.length) {
    consoleError('Setu.resources !', 'invalid key', saveKey)
    throw new TypeError(MSG_INVALID_META)
  }
  return match
}

function __res__regexMatchToKey(match) {
  return (match[3] +                      // Model
    (match[5] ? (':' + match[5]) : '') +  // Primary Key
    (match[10] ? ('|' + match[10]) : '')) // Filter Params
}

function res__regexMatchToParams(match, resource) {
  if(match[10]) { // match[10] -> params
    resource.params = __res__colonSeparatedListToObj(match[10])
    resource.queryparams = match[10].replace(/;/g, '&')
  }
}

function res__buildQueryParams(resource) {
  if(!resource.params) {
    return
  }
  var params = []
  for(var key in resource.params) {
    params.push(key + '=' + resource.params[key])
  }
  resource.queryparams = params.join('&')
}

function __res__colonSeparatedListToObj(str) {
  /**
   * These are the possible formats for str:
   * - a=3
   * - a=3;b=3;c=3;..
   * - a=x=3~y=2~z=3;b=3;c=3;..
  */
  var pairs = str.split(';'), obj = {}
  pairs.forEach(function(pair) {
    var match = pair.match(/^([^=]+)=(.*)$/)
    obj[match[1]] = match[2]
  })
  return obj
}

function __res__regexMatchToPk(match, resource) {
  if(match[5]) { // match[5] -> pk (one or multi)
    resource.pk = match[5]
    /* Multi-type PK if it's a comma separated list */
    resource.pkType = (match[5].match(/,/) ? PK_TYPE_MULTI : PK_TYPE_ONE)
    resource.type = KW_DETAIL
  } else {
    resource.type = KW_LIST
  }
}

function __res__genericTitle(resource) {
  return (KW_DETAIL === resource.type
    ? mconf__instanceName(resource.model.name)
    : mconf__listName(resource.model.name))
}

function __res__getOrSet(resource) {
  if(!GResources[resource.key]) {
    GResources[resource.key] = resource
    console.debug('Setu.resources +', resource.key, resource)
  } else {
    var title = resource.title
    resource = GResources[resource.key]
    if(title != resource.title) {
      resource.title = title
    }
    console.debug('Setu.resources .', resource.key, resource)
  }
  return resource
}

function __res__fetchOrGet(resource, onsuccess) {
  switch(resource.type) {
  case KW_LIST:
    __res__getList(resource, onsuccess)
    break
  case KW_DETAIL:
    res__getDetail(resource, onsuccess)
    break
  case KW_API:
    __res__getApi(resource, onsuccess)
    break
  }
}

function __res__getList(resource, onsuccess, forceFetch) {
  if(resource.value && !forceFetch) {
    onsuccess(__res__repr(resource))
  } else {
    if(!__res__hasFetchQueue(resource)) {
      __res__createFetchQueue(resource)
    } else {
      __res__enqueFetch(resource, onsuccess)
      return
    }
    backend__getList(resource.model, resource.queryparams,
    function(list, page, last, count) {
      resource.value = resource.value || []
      list.forEach(function(element) {
        resource.value.push(element)
      })
      resource.fetched_at = (new Date()).getTime()
      resource.page = page || 1
      resource.last = last
      resource.count = count
      console.info('Setu.resources + []', resource, list)
      lists__registerEvents(resource)
      var rep = __res__repr(resource)
      __res__processFetchQueue(resource, rep)
      onsuccess(rep)
    }, function(empty) {
      var rep = {title: resource.title, value: empty}
      __res__processFetchQueue(resource, rep)
      onsuccess(rep)
    })
  }
}

function res__reloadList(resource, onsuccess) {
  while(resource.value.length) {
    instances__purge(resource.value.pop())
  }
  __res__getList(resource, onsuccess, true)
}

function res__getDetail(resource, onsuccess) {
  if(resource.value) {
    onsuccess(__res__repr(resource))
  } else {
    if(!__res__hasFetchQueue(resource)) {
      __res__createFetchQueue(resource)
    } else {
      __res__enqueFetch(resource, onsuccess)
      return
    }
    backend__getDetail(resource.model, resource.pk, resource.pkType,
      resource.queryparams,
    function(instance) {
      resource.value = instance
      resource.fetched_at = (new Date()).getTime()
      console.info('Setu.resources + {}', resource, instance)
      details__registerEvents(resource)
      var rep = __res__repr(resource)
      __res__processFetchQueue(resource, rep)
      onsuccess(rep)
    },
    function(empty) {
      var rep = {title: resource.title, value: empty}
      __res__processFetchQueue(resource, rep)
      onsuccess(rep)
    })
  }
}

function res__reloadDetail(resource, onsuccess) {
  if(!__res__hasFetchQueue(resource)) {
    __res__createFetchQueue(resource)
  } else {
    __res__enqueFetch(resource, onsuccess)
    return
  }
  backend__reloadDetail(resource.value, resource.model, resource.pk,
      resource.pkType, resource.queryparams,
  function() {
    resource.fetched_at = (new Date()).getTime()
    var rep = __res__repr(resource)
    __res__processFetchQueue(resource, rep)
    if('function' === typeof(onsuccess)) {
      onsuccess(rep)
    }
  },
  function() {
    var rep = __res__repr(resource)
    __res__processFetchQueue(resource, rep)
  })
}

function __res__getApi(resource, onsuccess) {
  if(resource.value) {
    onsuccess(__res__repr(resource))
  } else {
    backend__getApi(resource.api, resource.queryparams, function(data) {
      resource.value = data
      console.info('Setu.resources + ://', resource)
      var rep = __res__repr(resource)
      onsuccess(rep)
    }, function(empty) {
      onsuccess({title: resource.title, value: empty})
    })
  }
}

var __ResourceFetchQueue = { }

function __res__hasFetchQueue(resource) {
  return (resource.key in __ResourceFetchQueue)
}

function __res__createFetchQueue(resource) {
  __ResourceFetchQueue[resource.key] = []
}

function __res__enqueFetch(resource, callback) {
  __ResourceFetchQueue[resource.key].push(callback)
  console.log('Setu.resources Q+', resource.key, callback)
}

function __res__processFetchQueue(resource, rep) {
  if(resource.key in __ResourceFetchQueue) {
    var queued = __ResourceFetchQueue[resource.key].slice()
    delete __ResourceFetchQueue[resource.key]
    console.log('Setu.resources Q-', resource.key, queued)
    queued.forEach(function(callback){
      if('function' === typeof(callback)) {
        callback(rep)
      }
    })
  }
}

function __res__repr(resource) {
  return {
    title: resource.title,
    value: resource.value
  }
}

function res__flushOne(key) {
  if(key in GResources) {
    __res__unregister(GResources[key])
    delete GResources[key]
  }
  console.info('Setu.resources x', key)
}

function res__clear() {
  for(var key in GResources) {
    if(GResources.hasOwnProperty(key)) {
      res__flushOne(key)
    }
  }
  console.info('Setu.resources x []')
}

function res__registerDetail(instance, imeta) {
  if(!(imeta.$k in GResources)) {
    var resource = {
      key: imeta.$k,
      model: imeta.$m,
      pk: instances__pkDef(instance),
      pkType: (1 === imeta.$m.pks.length) ? PK_TYPE_ONE : PK_TYPE_MULTI,
      title: mconf__instanceName(instance.__model__),
      type: KW_DETAIL,
      value: instance,
      fetched_at: (new Date()).getTime(),
    }
    details__registerEvents(resource)
    GResources[imeta.$k] = resource
    console.info('Setu.resources + {}', resource)
  }
}

function __res__unregister(resource) {
  if(KW_LIST === resource.type) {
    lists__unregisterEvents(resource)
  } else if(KW_DETAIL === resource.type) {
    details__unregisterEvents(resource)
  }
}

function res__getByKey(key) {
  return GResources[key]
}

function res__getModelInstances(modelName) {
  var list = []
  for(var key in GResources) {
    var resource = GResources[key]
    if(KW_DETAIL === resource.type && modelName === resource.model.name){
      list.push(resource.value)
    }
  }
  return list
}

ns.get = res__get
ns.getByKey = res__getByKey
ns.getModelInstances = res__getModelInstances

/*ns.printRes = function() {
  for(var key in GResources) {
    console.log(key, GResources[key])
  }
}*/
