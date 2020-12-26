var GModelsFilters,
  GModelsConfig,
  GNameResolution

function mconf__setup(filters, config) {
  GModelsConfig = config || {
    trailingSlash: true,
    nameResolution: 'Setu.models.NameResolutionDefault',
    urlPrefix: '',
    compositePkToUrl: ns.MULTI_PK_TO_URL_KEY_VALUE_PATH,
    compositePkSeparator: '_',
    validateInstances: true
  }
  GModelsConfig.updateLists = GModelsConfig.updateLists || {
    updateLists: {
      fields: {},
      filters: {},
      instanceFks: {},
    }
  }
  GModelsConfig.updateLists.fields = GModelsConfig.updateLists.fields || {}
  GModelsConfig.updateLists.filters = GModelsConfig.updateLists.filters || {}
  GModelsConfig.updateLists.instanceFks = GModelsConfig.updateLists.instanceFks || {}
  GModelsFilters = filters || {}
  /* eslint-disable no-eval */
  GNameResolution = eval(GModelsConfig.nameResolution)
  /* eslint-enable no-eval */
  console.info('Setu.mconf $ setup', GModelsConfig, GModelsFilters, GNameResolution)
}

function mconf__filter(instance, name) {
  var modelFilters = GModelsFilters[instance.__model__]
  if (modelFilters && 'function' === typeof(modelFilters[name])) {
    return modelFilters[name](instance)
  }
  return undefined
}

function mconf__listUpdate(type, listModel, instance) {
  var updateConf = GModelsConfig.updateLists[type][listModel]
  if(updateConf && instance) {
    updateConf = updateConf[instance.__model__]
  }
  return updateConf
}

function mconf__trailingChar() {
  return GModelsConfig.trailingSlash ? '/' : ''
}

function mconf__urlPrefix() {
  return GModelsConfig.urlPrefix
}

function mconf__model2path(modelName) {
  return GNameResolution.m2p(modelName)
}

function mconf__instanceName(modelName) {
  return GNameResolution.m2i(modelName)
}

function mconf__listName(modelName) {
  return GNameResolution.m2l(modelName)
}

function mconf__compositePkUrlScheme() {
  return GModelsConfig.compositePkToUrl
}

function mconf__compositePkSep() {
  return GModelsConfig.compositePkSeparator
}
