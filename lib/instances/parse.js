function iparse__ensureRequiredFields(modelName, modelDef, data, instanceCreated) {
  for(var field in modelDef) {
    if(__iparse__isFieldRequired(modelDef[field], instanceCreated) &&
      !(field in data))
    {
      consoleError('Setu.iparse ! instance data', data,
        'for model', modelName, 'does not have required field', field)
      throw new TypeError(MSG_INVALID_INSTANCE_DATA)
    }
  }
}

function __iparse__isFieldRequired(fieldDef, instanceCreated) {
  /**
   * These are the conditions where a value must be provided
   * for a given model field:
   *
   * - it's a primary key, instance is not yet created (copying
   *   given data to a UI instance which would be http__post'd to create
   *   a new backend instance), and there is no "auto" setting for
   *   this primary key
   * - or, it's a foreign key
   * - or, it's a primitive or array field and "optional" setting
   *   is not set to true
  */
  return (
    (fieldDef.pk && !instanceCreated && !fieldDef.auto)
    || fieldDef.fk
    || !fieldDef.optional)
}

function iparse__validateData(modelName, modelDef, data, instance) {
  for(var field in data) {
    if(field in modelDef) {
      __iparse__validateField(modelName, field, modelDef[field], data)
      instance[field] = data[field]
    }
  }
}

function __iparse__validateField(modelName, field, fieldDef, data) {
  var fieldType = mparse__fieldType(modelName, field, fieldDef)
  switch(fieldType) {
  case MODEL_FIELD_TYPE_PRIMITIVE:
    __iparse__validatePrimitiveField(modelName, field, fieldDef, data)
    break
  case MODEL_FIELD_TYPE_PK:
    __iparse__validatePkField(modelName, field, fieldDef, data)
    break
  case MODEL_FIELD_TYPE_FK:
    __iparse__validateFkField(modelName, field, fieldDef, data)
    break
  case MODEL_FIELD_TYPE_ARRAY:
    __iparse__validateArrayField(modelName, field, fieldDef, data)
    break
  }
}

function __iparse__validatePrimitiveField(modelName, field, fieldDef, data) {
  var type = fieldDef.type, value = data[field]
  if(__iparse__unallowedNull(value, fieldDef)) {
    consoleError('Setu.iparse !', modelName, 'model field', field,
      'is null in', data, 'which is not allowed')
    throw new TypeError(MSG_INVALID_INSTANCE_DATA)
  }
  else if(null !== value && !__iparse__primitiveOfType(value, type)) {
    consoleError('Setu.iparse !', modelName, 'model field', field,
      'is', value, 'in', data, 'which is not of required type:', type)
    throw new TypeError(MSG_INVALID_INSTANCE_DATA)
  }
}

function __iparse__validatePkField(modelName, field, fieldDef, data) {
  __iparse__validatePrimitiveField(modelName, field, fieldDef, data)
}

function __iparse__validateFkField(modelName, field, fieldDef, data) {
  /**
   * Foreign key fields can be whole objects of the related model
   * type, or they could just be values of the primary key of the
   * related model.
   *
   * In case whole object of the related model is provided, it's
   * verified against the corresponding model def
  */
  var relatedModel = models__get(fieldDef.fk)
  if(utils__isObject(data[field])) {
    var dummy = {}
    iparse__validateData(relatedModel.name, relatedModel.def,
      data[field], dummy)
  }
  else {
    var relatedPk = relatedModel.pks[0]
    __iparse__validateFkAgainstModel(relatedModel.name, relatedPk, relatedModel.def[relatedPk], modelName, field, fieldDef, data)
  }
}

function __iparse__validateFkAgainstModel(relatedName, relatedPk, relatedPkDef, modelName, field, fieldDef, data)
{
  var relatedPkType = relatedPkDef.type,
    value = data[field]
  if(__iparse__unallowedNull(value, fieldDef)) {
    consoleError('Setu.iparse !', modelName, 'model field', field,
      'is a foreign key to', relatedName, 'and is null in', data,
      'which is not allowed')
    throw new TypeError(MSG_INVALID_INSTANCE_DATA)
  }
  else if(null !== value && !__iparse__primitiveOfType(value, relatedPkType)) {
    consoleError('Setu.iparse !', modelName, 'model field', field,
      'is a foreign key to', relatedName, 'whose primary key', relatedPk,
      'is of type', relatedPkType, 'but the value is', value,
      'in', data)
    throw new TypeError(MSG_INVALID_INSTANCE_DATA)
  }
}

function __iparse__validateArrayField(modelName, field, fieldDef, data) {
  if(!utils__isArray(data[field])) {
    consoleError('Setu.iparse !', modelName, 'model field', field,
    'must be an array but the value is', data[field], 'in', data)
    throw new TypeError(MSG_INVALID_INSTANCE_DATA)
  }
  var type = mparse__arrayFieldType(modelName, field, fieldDef.elements)
  switch(type) {
  case MODEL_FIELD_TYPE_PRIMITIVE:
    __iparse__validatePrimitiveArray(modelName, field, fieldDef.elements, data)
    break
  case MODEL_FIELD_TYPE_FK:
    __iparse__validateFkArray(modelName, field, fieldDef.elements, data)
    break
  }
}

function __iparse__validatePrimitiveArray(modelName, field, elemsDef, data) {
  var type = elemsDef.type
  data[field].forEach(function(element) {
    if(__iparse__unallowedNull(element, elemsDef)) {
      consoleError('Setu.iparse !', modelName, 'model array field', field,
        'contains a null element in', data, 'which is not allowed')
    }
    else if(null !== element && !__iparse__primitiveOfType(element, type)) {
      consoleError('Setu.iparse !', modelName, 'model array field', field,
        'has', element, 'in', data, 'which is not of required type:', type)
      throw new TypeError(MSG_INVALID_INSTANCE_DATA)
    }
  })
}

function __iparse__validateFkArray(modelName, field, elemsDef, data) {
  data[field].forEach(function(element) {
    var relatedModel = models__get(elemsDef.fk)
    if(utils__isObject(element)) {
      var dummy = {}
      iparse__validateData(relatedModel.name, relatedModel.def, element, dummy)
    }
    else {
      var relatedPk = relatedModel.pks[0]
      __iparse__validateFkArrayMemberAgainstModel(relatedModel.name, relatedPk, relatedModel.def[relatedPk], modelName, element, elemsDef, data)
    }
  })
}

function __iparse__validateFkArrayMemberAgainstModel(relatedName, relatedPk,
  relatedPkDef, modelName, element, elemsDef, data)
{
  var relatedPkType = relatedPkDef.type
  if(__iparse__unallowedNull(element, elemsDef)) {
    consoleError('Setu.iparse !', modelName, 'model field', field,
      'contains foreign keys to', relatedName, 'and cannot have nulls',
      'but nulls are there in', data)
    throw new TypeError(MSG_INVALID_INSTANCE_DATA)
  }
  else if(null !== element && !__iparse__primitiveOfType(element, relatedPkType)) {
    consoleError('Setu.iparse !', modelName, 'model field', field,
      'contains foreign keys to', relatedName, 'whose primary key', relatedPk,
      'is of type', relatedPkType, 'but value of an array element', element,
      'in', data, 'does not match the type')
    throw new TypeError(MSG_INVALID_INSTANCE_DATA)
  }
}

function __iparse__unallowedNull(value, fieldDef) {
  return (null === value && !fieldDef.null)
}

function __iparse__primitiveOfType(primitive, type) {
  switch(type) {
  case MODEL_DEF_TYPE_BOOLEAN:
  case MODEL_DEF_TYPE_STRING:
    return (type === typeof(primitive))
  case MODEL_DEF_TYPE_INTEGER:
    return ('number' === typeof(primitive) && !primitive.toString().match(/\./))
  case MODEL_DEF_TYPE_DECIMAL:
    return ('number' === typeof(primitive))
  case MODEL_DEF_TYPE_DATETIME:
    return ('string' === typeof(primitive) && primitive.match(REGEX_DATETIME))
  case MODEL_DEF_TYPE_DATE:
    return ('string' === typeof(primitive) && primitive.match(REGEX_DATE))
  case MODEL_DEF_TYPE_TIME:
    return ('string' === typeof(primitive) && primitive.match(REGEX_TIME))
  case MODEL_DEF_TYPE_UUID:
    return ('string' === typeof(primitive) && primitive.match(REGEX_UUID))
  }
  return false
}
