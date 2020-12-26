function mparse__defs(modelsDefs) {
  for(var modelName in modelsDefs) {
    if(modelsDefs.hasOwnProperty(modelName)) {
      var modelDef = __mparse__validateDef(modelsDefs, modelName),
        pks = __mparse__validatePks(modelName, modelDef),
        fks = __mparse__extractFks(modelName, modelDef)
      models__set(modelName, __mparse__createModel(modelDef, modelName, pks, fks))
    }
  }
}

function __mparse__validateDef(modelsDefs, modelName) {
  var modelDef = __mparse__getDef(modelsDefs, modelName)
  __mparse__ensureNoReservedKWs(modelName, modelDef)
  for(var field in modelDef) {
    if(modelDef.hasOwnProperty(field)) {
      __mparse__validateFieldDef(modelsDefs, modelName, modelDef, field)
    }
  }
  return modelDef
}

function __mparse__getDef(modelsDefs, modelName) {
  var modelDef = modelsDefs[modelName]
  if(!utils__isObject(modelDef)) {
    consoleError('Setu.mparse !', modelName,
      'model definition must be an object', modelDef)
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
  return modelDef
}

function __mparse__ensureNoReservedKWs(modelName, modelDef) {
  RESERVED_MODEL_FIELDS.forEach(function(reserved) {
    if(reserved in modelDef) {
      consoleError('Setu.mparse !', reserved,
        'is used as a field in model', modelName,
        'but it is reserved')
      throw new TypeError(MSG_BADLY_CONFIGURED)
    }
  })
}

function __mparse__validateFieldDef(modelsDefs, modelName, modelDef, field) {
  /**
   * These are valid model field definition examples:
   * abc: {fk: 'OtherModel', null: true}
   * def: {fk: 'OtherModel'} --> null: false
   * ghi: {type: <non-str-primitive-type>} --> null: false, optional: false
   * jkl: {type: <str-type-primitive-type>} --> null: false, optional: false
   * mno: {type: <non-str-primitive-type>, null: true, optional: true}
   * pqr: {type: <str-type-primitive-type>, null: false, optional: true}
   * stu: {type: <primitive-type>, pk: true} --> auto: false
   * vwx: {type: <primitive-type>, pk: true, auto: true}
   * yz1: {type: 'array', elements: {type: <primitive-type>}} --> null, optional as above
   * abc: {type: 'array', elements: {fk: 'OtherModel'}} --> null, optional as above
  */
  var fieldDef = __mparse__getFieldDef(modelName, modelDef, field),
    fieldType = mparse__fieldType(modelName, field, fieldDef)
  switch(fieldType) {
  case MODEL_FIELD_TYPE_PRIMITIVE:
    __mparse__validatePrimitiveType(modelName, field, fieldDef, ALLOWED_PRIMITIVE_PARAMS)
    break
  case MODEL_FIELD_TYPE_PK:
    __mparse__validatePkType(modelName, field, fieldDef)
    break
  case MODEL_FIELD_TYPE_FK:
    __mparse__validateFk(modelsDefs, modelName, field, fieldDef)
    break
  case MODEL_FIELD_TYPE_ARRAY:
    __mparse__validateArrayType(modelsDefs, modelName, field, fieldDef)
    break
  }
}

function __mparse__getFieldDef(modelName, modelDef, field) {
  var fieldDef = modelDef[field]
  if(!utils__isObject(fieldDef)) {
    consoleError('Setu.mparse !', modelName, 'model field', field,
      'definition is not an object', fieldDef)
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
  return fieldDef
}

function mparse__fieldType(modelName, field, fieldDef) {
  __mparse__ensureTypeXorFk(modelName, field, fieldDef)
  return (MODEL_DEF_PARAM_TYPE in fieldDef
    ? MODEL_FIELD_TYPE_ARRAY !== fieldDef.type
      ? !(MODEL_DEF_PARAM_PK in fieldDef)
        ? MODEL_FIELD_TYPE_PRIMITIVE
        : MODEL_FIELD_TYPE_PK
      : MODEL_FIELD_TYPE_ARRAY
    : MODEL_FIELD_TYPE_FK)
}

function __mparse__validatePrimitiveType(modelName, field, fieldDef, allowedParams) {
  __mparse__forbidUnallowedTypes(modelName, field, fieldDef, ALLOWED_PRIMITIVE_TYPES)
  __mparse__forbidSpuriousParams(modelName, field, fieldDef, allowedParams)
}

function __mparse__validatePkType(modelName, field, fieldDef) {
  __mparse__validatePrimitiveType(modelName, field, fieldDef, ALLOWED_PK_PARAMS)
}

function __mparse__validateFk(modelsDefs, modelName, field, fieldDef) {
  __mparse__ensureFkModelExists(modelsDefs, modelName, field, fieldDef)
  __mparse__forbidSpuriousParams(modelName, field, fieldDef, ALLOWED_FK_PARAMS)
}

function __mparse__validateArrayType(modelsDefs, modelName, field, fieldDef) {
  __mparse__forbidSpuriousParams(modelName, field, fieldDef, ALLOWED_ARRAY_PARAMS)
  var type = mparse__arrayFieldType(modelName, field, fieldDef.elements)
  switch(type) {
  case MODEL_FIELD_TYPE_PRIMITIVE:
    __mparse__validatePrimitiveType(modelName, field, fieldDef.elements,
      ALLOWED_ARRAY_PRIMITIVE_PARAMS)
    break
  case MODEL_FIELD_TYPE_FK:
    __mparse__validateFk(modelsDefs, modelName, field, fieldDef.elements)
    break
  }
}

function __mparse__ensureTypeXorFk(modelName, field, fieldDef) {
  if(MODEL_DEF_PARAM_TYPE in fieldDef && MODEL_DEF_PARAM_FK in fieldDef) {
    consoleError('Setu.mparse !',
      'both "type" and "fk" are defined in', fieldDef,
      'in model', modelName, 'field', field)
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
  if(!(MODEL_DEF_PARAM_TYPE in fieldDef) && !(MODEL_DEF_PARAM_FK in fieldDef)) {
    consoleError('Setu.mparse !',
      'none of "type" and "fk" are defined in', fieldDef,
      'in model', modelName, 'field', field)
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
}

function __mparse__ensureFkModelExists(modelsDefs, modelName, field, fieldDef) {
  if(!(fieldDef.fk in modelsDefs)) {
    consoleError('Setu.mparse !',
      'model', fieldDef.fk, 'referred to in', fieldDef,
      'as a foreign key field', field, 'in model', modelName,
      'does not exist')
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
}

function __mparse__forbidUnallowedTypes(modelName, field, fieldDef, allowed) {
  if(!allowed.contains(fieldDef.type)) {
    consoleError('Setu.mparse !',
      'unsupported type', fieldDef.type,
      'in', fieldDef, 'in model', modelName,
      'field', field, 'allowed ones are:', allowed)
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
}

function __mparse__forbidSpuriousParams(modelName, field, fieldDef, allowed) {
  for(var key in fieldDef) {
    if(fieldDef.hasOwnProperty(key) && !allowed.contains(key)) {
      consoleError('Setu.mparse !',
        'unsupported parameter', key,
        'in', fieldDef, 'in model', modelName,
        'field', field, 'allowed ones are:', allowed)
      throw new TypeError(MSG_BADLY_CONFIGURED)
    }
  }
}

function mparse__arrayFieldType(modelName, field, elements) {
  __mparse__ensureTypeXorFk(modelName, field, elements)
  return (elements.type ? MODEL_FIELD_TYPE_PRIMITIVE : MODEL_FIELD_TYPE_FK)
}

function __mparse__validatePks(modelName, modelDef) {
  var pks = []
  for(var field in modelDef) {
    if(modelDef.hasOwnProperty(field) && modelDef[field].pk) {
      pks.push(field)
    }
  }
  if(!pks.length) {
    consoleError('Setu.mparse !', 'model', modelName,
      'does not have any primary keys defined')
    throw new TypeError(MSG_BADLY_CONFIGURED)
  }
  return pks
}

function __mparse__extractFks(modelName, modelDef) {
  var fks = {}
  for(var field in modelDef) {
    if(modelDef.hasOwnProperty(field) && modelDef[field].fk) {
      fks[field] = modelDef[field].fk
    }
  }
  return fks
}

function __mparse__createModel(modelDef, name, pks, fks) {
  var model = {}
  model.name = name
  model.prefix = mconf__urlPrefix() + '/' +
    mconf__model2path(model.name)
  model.def = modelDef
  model.pks = pks
  model.fks = fks
  model.iType = __mparse__createInstanceProto(model)
  console.debug('Setu.mparse +', model)
  return model
}

function __mparse__createInstanceProto(model) {
  var object = {}
  for(var field in model.def) {
    if(model.def.hasOwnProperty(field)) {
      object[field] = {
        get: (ifields__getter(field)),
        set: (ifields__setter(field)),
        enumerable: true
      }
    }
  }
  object.__model__ = {
    value: model.name,
    writable: false,
    enumerable: false,
    configurable: false
  }
  return object
}
