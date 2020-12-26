var GSseSetup = false

function sse__isSetup() {
  return GSseSetup
}

function sse__setup(path) {
  var origin = location.protocol + '//' + location.host,
    eventStream = new EventSource(origin + path)
  eventStream.addEventListener('created', __sse__oncreate)
  eventStream.addEventListener('updated', __sse__onupdate)
  eventStream.addEventListener('deleted', __sse__ondelete)
  GSseSetup = true
}

function __sse__oncreate() {
  try {
    var data = JSON.parse(e.data)
    console.info('Setu.sse --> create', data)
    var resKey = data.model + ':' + data.pk,
      resource = GResources[resKey]
    if(resource) {
      console.debug('Setu.sse create $ resource available in-memory', resKey, GResources[resouce].value)
      return
    }
    __sse__fetchDetail(resKey)
  } catch(err) {
    console.warn(err.message, err.stack)
  }
}

function __sse__onupdate(e) {
  try {
    var data = JSON.parse(e.data)
    console.info('Setu.sse --> update', data)
    var resKey = data.model + ':' + data.pk,
      resource = GResources[resKey]
    if(resource) {
      if(resource.fetched_at >= data.timestamp) {
        console.debug('Setu.sse update $ resource in-memory copy is newer',
          resKey, data.timestamp, resource.fetched_at)
        return
      }
      res__reloadDetail(resource)
    } else {
      __sse__fetchDetail(resKey)
    }
  } catch(err) {
    console.warn(err.message, err.stack)
  }
}

function __sse__ondelete() {
  try {
    var data = JSON.parse(e.data)
    console.info('Setu.sse --> delete', data)
    var resKey = data.model + ':' + data.pk,
      resource = GResources[resKey]
    if(!resource) {
      console.debug('Setu.sse delete $ non-existent resource', resKey)
      return
    }
    var instance = resource.value,
      imeta = imeta__get(instance)
    events__fireTo(ns.EVENT_INSTANCE_DELETE, imeta.$k, instance)
    events__fireTo(ns.EVENT_INSTANCE_DELETE, instance.__model__, instance)
    instances__purge(instance)
  } catch(err) {
    console.warn(err.message, err.stack)
  }
}

function __sse__fetchDetail(resKey) {
  var resource = res__parseKey(resKey)
  res__getDetail(resource, function(res){
    var instance = res.value
    if(Object.keys(instance).length) {
      // session was permitted by backend to load this instance
      events__fireTo(ns.EVENT_INSTANCE_CREATE, instance.__model__, instance)
    }
  })
}
