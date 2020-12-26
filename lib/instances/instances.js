function instances__setup(instance) {
  var imeta = imeta__new(instance),
    model = imeta.$m
  for(var field in model.def) {
    var fieldDef = model.def[field],
      initValue = ('array' !== fieldDef.type ? undefined : [])
    imeta.$i[field] = ifields__set(initValue)
  }
}

function instances__delete(instance) {
  var model = models__get(instance.__model__),
    imeta = imeta__get(instance)
  for(var field in model.def) {
    var idx = imeta.$i[field]
    ifields__delete(idx)
  }
  imeta__delete(instance)
  console.debug('Setu.models',
    ifields__count(), 'instance fields in runtime',
    imeta__count(), 'instances in runtime')
}

function instances__init(instance, data, forDetailRes) {
  if(data) {
    var modelName = instance.__model__
      model = models__get(modelName),
      modelDef = model.def,
      imeta = imeta__get(instance)
    iparse__ensureRequiredFields(modelName, modelDef, data, imeta.$d)
    iparse__validateData(modelName, modelDef, data, instance)
    imeta.$d = true
    imeta__setKey(instance, imeta, modelName + ':' + instances__pkDef(instance))
    if(!forDetailRes) {
      res__registerDetail(instance, imeta)
    }
  }
}

function instances__pkDef(instance) {
  var model = models__get(instance.__model__)
  if(1 === model.pks.length) {
    return instance[model.pks[0]]
  } else {
    var keyValuePairs = []
    model.pks.forEach(function(pk){
      keyValuePairs.push(pk + '=' + instance[pk])
    })
    return keyValuePairs.join(';')
  }
}

function instances__pkDefToObj(def) {
  var parts = def.split(';'),
    obj = {}
  parts.forEach(function(part){
    var kv = part.split('=')
    obj[kv[0]] = kv[1]
  })
  return obj
}

function instances__ensureNotCreated(instance, imeta, onsuccess) {
  if(imeta.$d) {
    consoleError('Setu.instances',
      'internal programming error or user-forced recreation ' +
      'of an already created instance',
      instance)
    onsuccess(instance)
    return false
  }
  return true
}

function instances__createData(instance, imeta) {
  var dataToSend = {},
    modelDef = imeta.$m.def
  for(var field in modelDef) {
    if(modelDef.hasOwnProperty(field) && !modelDef[field].auto) {
      dataToSend[field] = instance[field]
    }
  }
  return dataToSend
}

function instances__ensureCreated(instance, imeta, onsuccess) {
  if(!imeta.$d) {
    consoleError('Setu.instances',
      'internal programming error or user forced update of an ' +
      'instance that does not exist in backend',
      instance)
    onsuccess(instance)
    return false
  }
  return true
}

function instances__updateData(instance, imeta) {
  var dataToSend = {}
  for(var field in imeta.$c) {
    if(imeta.$c.hasOwnProperty(field)) {
      dataToSend[field] = imeta.$c[field].newVal
    }
  }
  return (Object.keys(dataToSend).length ? dataToSend: null)
}

function instances__updateChanges(instance, imeta) {
  if(!Object.keys(imeta.$c).length) {
    return
  }
  var changes = { }
  for(var field in imeta.$c) {
    changes[field] = imeta.$c[field]
  }
  imeta.$s = true
  for(var field in changes) {
    instance[field] = changes[field].newVal
  }
  imeta.$s = false
  imeta.$c = {}
  return changes
}

function instances__createUrl(instance, imeta) {
  var url = imeta.$m.prefix + mconf__trailingChar()
  if(imeta.$qp) {
    url += '?' + imeta.$qp
    delete imeta.$qp
  }
  return url
}

function instances__url(instance, imeta) {
  var model = imeta.$m,
    pkType = (1 === model.pks.length ? PK_TYPE_ONE : PK_TYPE_MULTI),
    pk = __instances__pk(model, pkType, instance),
    url = models__detailUrl(model, pk, pkType, imeta.$qp)
  if(imeta.$qp) {
    delete imeta.$qp
  }
  return url
}

function __instances__pk(model, pkType, instance) {
  return PK_TYPE_ONE === pkType ?
    instance[model.pks[0]] :
    __instances__compositePk(model.pks, instance)
}

function __instances__compositePk(pks, instance) {
  var pkArr = []
  pks.forEach(function(pk) {
    pkArr.push(pk + '=' + instance[pk])
  })
  return pkArr.join(',')
}

function instances__purge(instance) {
  res__flushOne(imeta__get(instance).$k)
  instances__delete(instance)
}

function instances__data(instance) {
  var data = {},
    modelDef = imeta.$m.def
  for(var field in modelDef) {
    if(modelDef.hasOwnProperty(field)) {
      data[field] = instance[field]
    }
  }
  return data
}
