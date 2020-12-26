function backend__getList(model, params, onsuccess, onerror) {
  params = params || ''
  var url = models__listUrl(model, params)
  http__get(url, {format: 'json'}, function(response) {
    __backend__processList(model, response, onsuccess)
  }, function(e) {
    console.warn('Setu.backend ! list', model, e.message, e.stack)
    if('function' === typeof(onerror)) {
      onerror([])
    }
  })
}

function __backend__processList(model, response, onsuccess) {
  var output = adapters__run(ns.ADAPTER_MODELS_LIST, response)[0]
  var instances = []
  output.list.forEach(function(detail) {
    var instance = models__createInstance(model)
    instances__init(instance, detail)
    instances.push(instance)
  })
  console.info('Setu.backend $ list', model, instances)
  onsuccess(instances, output.page, output.last, output.count)
}

function backend__getDetail(model, pk, pkType, queryParams, onsuccess, onerror) {
  var url = models__detailUrl(model, pk, pkType, queryParams)
  http__get(url, {format: 'json'}, function(response) {
    __backend__processDetail(model, response, onsuccess)
  },
  function(e) {
    console.warn('Setu.backend ! detail', model, e.message, e.stack)
    if('function' === typeof(onerror)) {
      onerror({})
    }
  })
}

function __backend__processDetail(model, response, onsuccess) {
  var data = response.data
  var instance = models__createInstance(model)
  instances__init(instance, data, true)
  console.info('Setu.backend $ detail', model, instance)
  onsuccess(instance)
}

function backend__reloadDetail(instance, model, pk, pkType, queryParams, onsuccess, onerror) {
  var url = models__detailUrl(model, pk, pkType, queryParams),
    imeta = imeta__get(instance)
  http__get(url, {format: 'json'}, function(response) {
    __backend__patchInstance(instance, imeta, response)
    onsuccess()
  },
  function(e) {
    console.warn('Setu.backend ! detail', model, e.message, e.stack)
    onerror()
  })
}

function backend__getApi(path, queryparams, onsuccess, onerror) {
  http__get(path + (queryparams ? '?' + queryparams : ''),
           {format: 'json'},
  function(response) {
    onsuccess(response.data)
  },
  function(e) {
    console.warn('Setu.backend ! api', path, queryparams, e.message, e.stack)
    if('function' === typeof(onerror)) {
      onerror({})
    }
  })
}

function backend__saveInstance(instance, onsuccess, onerror) {
  var imeta = imeta__get(instance)
  if(imeta.$d) {
    return __backend__updateInstance(instance, imeta, onsuccess, onerror)
  } else {
    return __backend__createInstance(instance, imeta, onsuccess, onerror)
  }
}

function __backend__createInstance(instance, imeta, onsuccess, onerror) {
  if(!instances__ensureNotCreated(instance, imeta, onsuccess)) {
    return
  }
  http__post(instances__createUrl(instance, imeta), {
    data: instances__createData(instance, imeta),
    contentType: CONTENT_TYPE_JSON,
    format: 'json'
  }, function(response) {
    instances__init(instance, response.data)
    console.info('Setu.instances +', instance)
    var instanceData = instances__data(instance)
    events__fireTo(ns.EVENT_INSTANCE_CREATE, instance.__model__, instance)
    onsuccess(instanceData)
  }, function(e) {
    console.warn('Setu.instances +!', instance, e.message, e.stack)
    if('function' === typeof(onerror)) {
      onerror(JSON.parse(e.message))
    }
  })
}

function __backend__updateInstance(instance, imeta, onsuccess, onerror) {
  if(!instances__ensureCreated(instance, imeta, onsuccess)) {
    return
  }
  var dataToSend = instances__updateData(instance, imeta)
  if(!dataToSend) {
    return
  }
  http__patch(instances__url(instance, imeta), {
    data: dataToSend,
    contentType: CONTENT_TYPE_JSON,
    format: 'json'
  }, function(response) {
    var instanceData = __backend__populateInstance(instance, imeta, response)
    onsuccess(instanceData)
  }, function(e) {
    console.warn('Setu.instances ! update', instance, e.message, e.stack)
    if('function' === typeof(onerror)) {
      onerror(JSON.parse(e.message))
    }
  })
}

function __backend__populateInstance(instance, imeta, response) {
  var data = response.data,
    modelDef = imeta.$m.def,
    modelName = instance.__model__
  imeta.$s = true
  iparse__validateData(modelName, modelDef, data, instance)
  imeta.$s = false
  console.info('Setu.instances ~', instance)
  var instanceData = instances__data(instance)
  events__fireTo(ns.EVENT_INSTANCE_CHANGE, imeta.$k, instance, imeta.$c)
  events__fireTo(ns.EVENT_INSTANCE_CHANGE, instance.__model__, instance, imeta.$c)
  imeta.$c = {}
  return instanceData
}

function __backend__patchInstance(instance, imeta, response) {
  var data = response.data,
    modelDef = imeta.$m.def,
    modelName = instance.__model__
  iparse__validateData(modelName, modelDef, data, instance)
  if(Object.keys(imeta.$c).length) {
    console.info('Setu.instances ~', instance)
    var changes = instances__updateChanges(instance, imeta)
    events__fireTo(ns.EVENT_INSTANCE_CHANGE, imeta.$k, instance, changes)
    events__fireTo(ns.EVENT_INSTANCE_CHANGE, instance.__model__, instance, changes)
  }
}

function backend__deleteInstance(instance, callback, param) {
  var imeta = imeta__get(instance)
  http__delete(instances__url(instance, imeta), {
    format: 'json'
  }, function(response) {
    console.info('Setu.instances x', instance)
    events__fireTo(ns.EVENT_INSTANCE_DELETE, imeta.$k, instance)
    events__fireTo(ns.EVENT_INSTANCE_DELETE, instance.__model__, instance)
    instances__purge(instance)
    if('function' === typeof(callback)) {
      callback(param)
    }
  }, function(e) {
    console.info('Setu.instances ! delete', instance, e.message, e.stack)
  })
}
