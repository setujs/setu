var GModels = {}

function models__setup(modelsDefs, filters, config) {
  mconf__setup(filters, config)
  mparse__defs(modelsDefs)
  console.info('Setu.models $ setup', GModels)
}

function models__set(modelName, model) {
  GModels[modelName] = model
}

function models__get(modelName) {
  if(!GModels[modelName]) {
    consoleError('Setu.models ! model', modelName, 'not defined by application')
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
  return GModels[modelName]
}

function models__get_silent(modelName) {
  return GModels[modelName]
}

function models__createInstance(model) {
  /**
   * The iType attribute serves as the prototype for the
   * new instance object.
   * All instance fields are initialized by undefined or an empty
   * array in case the field has an array type as per model defs
  */
  var imetaIdx = imeta__next()
  model.iType.__meta_idx__ = {
    value: imetaIdx,
    writable: true,
    enumerable: false,
    configurable: false,
  }
  var instance = Object.create(Object.prototype, model.iType)
  delete model.iType.__meta_idx__
  instances__setup(instance)
  return instance
}

function models__listUrl(model, params) {
  return model.prefix + mconf__trailingChar() +
    (params ? '?' + params : '')
}

function models__detailUrl(model, pk, pkType, queryParams) {
  /**
   * For single primary key in model:
   * /<model>s/:pk/
   * /<model>s/:pk/?:queryparams
   *
   * For composite primary key in model following is supported:
   *
   * compositePkToUrl === 'KeyValuePath' ==>
   * /<model>s/:key1/:value1/:key2/:value2/
   * /<model>s/:key1/:value1/:key2/:value2/?:queryparams
   *
   * compositePKToUrl === 'OrderedValuesPath' ==>
   * /<model>s/:value1/:value2/
   * /<model>s/:value1/:value2/?:queryparams
   *
   * compositePKToUrl === 'OrderedSeparatedValues' ==>
   * /<model>s/:value1<sep>:value2/
   * /<model>s/:value1<sep>:value2/?:queryparams
  */
  return (model.prefix + '/' +
    __models__pkUrlComponent(pk, pkType) +
    mconf__trailingChar() +
    (queryParams ? '?' + queryParams : ''))
}

function __models__pkUrlComponent(pk, pkType) {
  return (PK_TYPE_ONE === pkType ? pk : __models__compositePkUrlComponent(pk))
}

function __models__compositePkUrlComponent(pk) {
  switch(mconf__compositePkUrlScheme()) {
  case ns.MULTI_PK_TO_URL_KEY_VALUE_PATH:
    return pk.replace(/,/, '/')
  case ns.MULTI_PK_TO_URL_ORDERED_VALUES_PATH:
    return __models__compositePkOrderedList(pk, '/')
  case ns.MULTI_PK_TO_URL_ORDERED_SEPERATED_VALUES:
    return __models__compositePkOrderedList(pk, mconf__compositePkSep() || '_')
  }
}

function __models__compositePkOrderedList(pk, separator) {
  var keyValuePairs = pk.split(','), values = []
  keyValuePairs.forEach(function(keyValuePair) {
    values.push(keyValuePair.replace(/^[^=]+=/, ''))
  })
  return values.join(separator)
}
