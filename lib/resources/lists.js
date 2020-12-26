function lists__registerEvents(list) {
  if(!list.registered) {
    events__registerFrom(ns.EVENT_INSTANCE_CREATE, list.model.name, __lists__onInstanceCreate, list)
    events__registerFrom(ns.EVENT_INSTANCE_CHANGE, list.model.name, __lists__onInstanceChange, list)
    events__registerFrom(ns.EVENT_INSTANCE_DELETE, list.model.name, __lists__onInstanceDelete, list)
    var paramsFks = {}
    if(list.params) {
      paramsFks = __lists__paramFks(list)
      for(var fk in paramsFks) {
        var fkModel = paramsFks[fk]
        events__registerFrom(ns.EVENT_INSTANCE_CHANGE, (fkModel + ':' + list.params[fk]),
                             __lists__onFilterInstanceChange, list)
        events__registerFrom(ns.EVENT_INSTANCE_DELETE, (fkModel + ':' + list.params[fk]),
                             __lists__onFilterInstanceDelete, list)
      }
    }
    for(var fk in list.model.fks) {
      if(!(fk in paramsFks)) {
        var fkModel = list.model.fks[fk]
        events__registerFrom(ns.EVENT_INSTANCE_CREATE, fkModel, __lists__onFkInstanceCreate, list)
        events__registerFrom(ns.EVENT_INSTANCE_CHANGE, fkModel, __lists__onFkInstanceChange, list)
        events__registerFrom(ns.EVENT_INSTANCE_DELETE, fkModel, __lists__onFkInstanceDelete, list)
      }
    }
    list.registered = true
  }
}

function lists__unregisterEvents(list) {
  if(list.registered) {
    events__unregisterFrom(ns.EVENT_INSTANCE_CREATE, list.model.name, list)
    events__unregisterFrom(ns.EVENT_INSTANCE_CHANGE, list.model.name, list)
    events__unregisterFrom(ns.EVENT_INSTANCE_DELETE, list.model.name, list)
    var paramsFks = {}
    if(list.params) {
      paramsFks = __lists__paramFks(list)
      for(var fk in paramsFks) {
        var fkModel = paramsFks[fk]
        events__unregisterFrom(ns.EVENT_INSTANCE_CHANGE, (fkModel + ':' + list.params[fk]), list)
        events__unregisterFrom(ns.EVENT_INSTANCE_DELETE, (fkModel + ':' + list.params[fk]), list)
      }
    }
    for(var fk in list.model.fks) {
      if(!(fk in paramsFks)) {
        var fkModel = list.model.fks[fk]
        events__unregisterFrom(ns.EVENT_INSTANCE_CREATE, fkModel, list)
        events__unregisterFrom(ns.EVENT_INSTANCE_CHANGE, fkModel, list)
        events__unregisterFrom(ns.EVENT_INSTANCE_DELETE, fkModel, list)
      }
    }
    list.registered = false
  }
}

function __lists__onInstanceCreate(list, instance) {
  if(__lists__instanceBelongs(list, instance)) {
    __lists__addInstance(list, instance)
  }
}

function __lists__onInstanceChange(list, instance, changed) {
  var belongs = __lists__instanceBelongs(list, instance),
    member = list.value.contains(instance)
  if(!belongs && member) {
    __lists__removeInstance(list, instance)
  } else if(belongs && !member) {
    __lists__addInstance(list, instance)
  } else if(member) {
    var updateConf = mconf__listUpdate(MODEL_CONF_UL_FIELDS, list.model.name)
    if(updateConf) {
      __lists__confBasedReload(list, updateConf, changed)
    }
  }
}

function __lists__onInstanceDelete(list, instance) {
  if(list.value.contains(instance)) {
    __lists__removeInstance(list, instance)
  }
}

function __lists__onFilterInstanceChange(list, instance, changed) {
  var updateConf = mconf__listUpdate(MODEL_CONF_UL_FILTERS, list.model.name, instance)
  if(updateConf && (
        !list.value.length ||
        __lists__depOnInstance(list, instance)))
  {
    __lists__confBasedReload(list, updateConf, changed)
  }
}

function __lists__onFilterInstanceDelete(list, instance) {
  if(!list.value.length || __lists__depOnInstance(list, instance)) {
    events__fireTo(ns.EVENT_LIST_RESOURCE_DELETE, list.key, list)
    res__flushOne(list)
  }
}

function __lists__onFkInstanceCreate(list, instance) {
  var updateConf = mconf__listUpdate(MODEL_CONF_UL_INSTANCE_FKS, list.model.name, instance)
  if(updateConf && __lists__depOnInstanceFkAlways(updateConf)) {
    lists__reloadOnChange(list, true)
  }
}

function __lists__onFkInstanceChange(list, instance, changed) {
  var updateConf = mconf__listUpdate(MODEL_CONF_UL_INSTANCE_FKS, list.model.name, instance)
  if(updateConf && (
        !list.value.length ||
        __lists__memberHasInstanceAsFk(list, instance) ||
        __lists__depOnInstanceFkAlways(updateConf)))
  {
    __lists__confBasedReload(list, updateConf, changed)
  }
}

function __lists__onFkInstanceDelete(list, instance) {
  if(!list.value.length || __lists__memberHasInstanceAsFk(list, instance)) {
    lists__reloadOnChange(list, true)
    return
  }
  var updateConf = mconf__listUpdate(MODEL_CONF_UL_INSTANCE_FKS, list.model.name, instance)
  if(updateConf && __lists__depOnInstanceFkAlways(updateConf)) {
    lists__reloadOnChange(list, true)
  }
}

function __lists__instanceBelongs(list, instance) {
  if(list.params) {
    for(var field in list.params) {
      if(field in instance) {
        return __lists__paramFieldMatchesInstanceField(list, instance, field)
      }
      else if(!__lists__paramFieldMatchesPrimitive(list.params[field], mconf__filter(instance, field))) {
        console.debug('Setu.lists !ϵ - special list filter excludes instance', instance, list, field)
        return false
      }
    }
  }
  console.debug('Setu.lists ϵ', instance, list)
  return true
}

function __lists__paramFieldMatchesInstanceField(list, instance, field) {
  if(utils__isObject(instance[field])) {
    return __lists__paramFieldMatchesAnFkField(list, instance, field)
  } else {
    if(!__lists__paramFieldMatchesPrimitive(list.params[field], instance[field])) {
      console.debug('Setu.lists !ϵ - list filter different from instance field', instance, field, list)
      return false
    }
  }
  return true
}

function __lists__paramFieldMatchesAnFkField(list, instance, field) {
  var imeta = imeta__get(instance),
    fk = imeta.$m.def[field].fk
  if(fk) {
    return __lists__paramFieldMatchesFkPks(list, instance, field, models__get(fk))
  } else {
    consoleError('Setu.lists !ϵ - field in instance is an object however it was not defined as a foreign key', instance, field, list)
    return false
  }
}

function __lists__paramFieldMatchesFkPks(list, instance, field, fkModel) {
  if(1 === fkModel.pks.length) {
    if(!__lists__paramFieldMatchesPrimitive(list.params[field], instance[field] && instance[field][fkModel.pks[0]])) {
      console.debug('Setu.lists !ϵ - list filter differs from related instance fk field', instance, field, list)
      return false
    }
  } else {
    var pkObj = instances__pkDefToObj(list.params[field])
    for(var pk in pkObj) {
      if(!__lists__paramFieldMatchesPrimitive(pkObj[pk], instance[field] && instance[field][pk])) {
        console.debug('Setu.lists !ϵ - list filter pk differs from instance fk field pk', instance, field, pk, list)
        return false
      }
    }
  }
  console.debug('Setu.lists ϵ', instance, list)
  return true
}

function __lists__paramFieldMatchesPrimitive(paramsField, instanceField) {
  try {
    if('string' !== typeof(instanceField)) {
      var adapted = adapters__run(ns.ADAPTER_FILTER_VALUE, paramsField)
      return eval(adapted[0]) === instanceField
    } else {
      return paramsField === instanceField
    }
  } catch(e) {
    console.debug(e.messsage, e.stack)
    return false
  }
}

function __lists__paramFks(list) {
  var fks = {}
  for(var param in list.params) {
    if(param in list.model.fks){
      fks[param] = list.model.fks[param]
    }
  }
  return fks
}

function __lists__depOnInstance(list, instance) {
  var depends = false,
    modelDef = list.model.def
  for(var param in list.params) {
    if(modelDef[param] &&
       modelDef[param].fk === instance.__model__ &&
       instances__pkDef(instance).toString() === list.params[param])
    {
      depends = true
      break
    }
  }
  console.debug('Setu.lists $ depends?', list, instance, depends)
  return depends
}

function __lists__memberHasInstanceAsFk(list, instance) {
  var fkModel = instance.__model__,
    fkField
  for(var fk in list.model.fks) {
    if(fkModel === list.model.fks[fk]) {
      fkField = fk
      break
    }
  }
  if(!fkField) {
    return false
  }
  var result = false
  for(var idx = 0; idx < list.value.length; ++idx) {
    var member = list.value[idx]
    if(member[fkField] === instances__pkDef(instance)) {
      console.debug('Setu.lists $ member-has-instance-fk', list, member, instance, fkField)
      return true
    }
  }
  return false
}

function __lists__depOnInstanceFkAlways(updateConf) {
  return ('always' === updateConf.__trigger__)
}

function __lists__addInstance(list, instance) {
  list.value.unshift(instance)
  console.info('Setu.lists [+]', list, instance)
  if(list.value.length > 1) {
    lists__reloadOnChange(list)
  } else {
    console.info('Setu.lists @ 1', list)
    events__fire(ns.EVENT_LIST_RESOURCE_CREATE, list)
  }
}

function __lists__removeInstance(list, instance) {
  list.value.remove(instance)
  console.info('Setu.lists [-]', list, instance)
  lists__reloadOnChange(list)
}

function __lists__confBasedReload(list, updateConf, changed) {
  var toReload = false
  if(true === updateConf) {
    toReload = true
  } else {
    for(var field in changed) {
      if(field in updateConf) {
        toReload = true
        break
      }
    }
  }
  if(toReload) {
    console.debug('Setu.lists reload-on-instance-change', toReload, list, updateConf, changed)
    lists__reloadOnChange(list, true)
  }
}

function lists__reloadOnChange(list, unsetModifiers) {
  console.info('Setu.lists ^ reload', list)
  if(unsetModifiers) {
    var match = list.key.match(REGEX_RESOURCE),
      pageSizeParam = Setu.pageSizeParam || Setu.PAGE_SIZE_PARAM,
      pageSize = list.params[pageSizeParam]
    res__regexMatchToParams(match, list)
    if(pageSize) {
      list.params[pageSizeParam] = pageSize
    }
    res__buildQueryParams(list)
    console.debug('Setu.lists $ reload unset-modifiers', list, list.params, list.queryparams)
  }
  res__reloadList(list, function(results) {
    binds__doIfNotYetDone(list)
    events__fireTo(ns.EVENT_LIST_RESOURCE_CHANGE, list.key, list)
  })
}

ns.reloadList = lists__reloadOnChange
