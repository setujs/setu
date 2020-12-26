function forms__setup(form, emeta) {
  if(!document.body.contains(form) || emeta.$f) {
    return
  }
  events__register(ns.EVENT_META_RENDER, __forms__onMetaRender, form)
}

function __forms__onMetaRender(form) {
  events__unregister(ns.EVENT_META_RENDER, form)
  __forms__fixSelects(form)
  var parsed = syn__parseFormEntity(form)
  if(!parsed) {
    return
  }
  var emeta = emeta__get(form)
  switch(parsed.type) {
  case KW_MODEL:
    __forms__setup(form, emeta, models__createInstance(parsed.model))
    break
  case KW_INSTANCE:
    var resources
    if((resources = res__ifAvailable([parsed.resource]))) {
      __forms__setup(form, emeta, resources[Object.keys(resources)[0]])
    } else {
      res__get([parsed.resource], {}, function(resources) {
        __forms__setup(form, emeta, resources[Object.keys(resources)[0]])
      })
    }
    break
  }
}

function __forms__fixSelects(form) {
  form.querySelectorAll('select').forEach(function(select) {
    forms__fixSelect(select)
  })
}

function forms__fixSelect(select) {
  if(select.hasAttribute('value')) {
    var value = select.getAttribute('value'),
      option = select.querySelector('option[value="' + value + '"]')
    if(option) {
      select.value = option.value
      console.debug('Setu.forms select value', select, option)
      return
    }
  }
  var option = select.querySelector('option[selected]')
  if(option) {
    select.value = option.value
    console.debug('Setu.forms select value', select, option)
  }
}

function __forms__setup(form, emeta, instance) {
  emeta.$i = instance
  var _existingOnsubmit = ('function' === typeof(form.onsubmit) ? form.onsubmit : null),
    onsubmit = __forms__submitHandler(form, emeta)
  if(_existingOnsubmit) {
    form.onsubmit = function() {
      var ret = _existingOnsubmit()
      if(__forms__getRelated(form).length) {
        return (onsubmit() && ret)
      } else {
        return ret && onsubmit()
      }
    }
  } else {
    form.onsubmit = onsubmit
  }
  emeta.$f = true
  console.debug('Setu.forms $ form', form, emeta, emeta.$i)
}

function __forms__submitHandler(form, emeta) {
  return function() {
    console.debug('Setu.forms ^ submit', form)
    if(form.hasAttribute(FORM_RELATED_AS)) {
      console.debug('Setu.forms $ related-form submit', form)
      return false
    }
    try {
      /* Validate the form and any of its related forms */
      var relatedForms = __forms__getRelated(form)
      console.debug('Setu.forms ^ related', form, relatedForms)
      if(!__forms__validateAll(form, relatedForms)) {
        return false
      }
      /* Populate form's instance with form data */
      __forms__populateInstance(form, emeta)
      /* Copy instances of related forms into this form */
      __forms__copyRelated(form, emeta, relatedForms)
      /* Copy any query params */
      __forms__copyQueryParams(form, emeta)
      /* Save (create/update) instance now */
      backend__saveInstance(emeta.$i, function(instance) {
        console.info('Setu.forms $ form-submit', form, instance)
        __forms__resetAll(form, emeta, relatedForms)
        events__fire(ns.EVENT_FORM_SUCCESS, form, instance)
      }, function(e) {
        consoleError('Setu.forms ! form-submit', form)
        __forms__resetAll(form, emeta, relatedForms)
        events__fire(ns.EVENT_FORM_ERROR, form, e)
      })
      return false
    } catch (e) {
      console.info('Setu.forms ! form-submit', e.message, e.stack)
      return false
    }
  }
}

function __forms__validateAll(form, relatedForms) {
  var ret = __forms__validate(form)
  if(form.error || form.getAttribute('error')) {
    ret = false
  }
  return __forms__validateRelated(relatedForms) && ret
}

function __forms__validate(form) {
  return !(adapters__run(ns.ADAPTER_VALIDATE_FORM, form).contains(false))
}

function __forms__getRelated(form) {
  if(form.getAttribute('name')) {
    return document.querySelectorAll(
      'form[foreign-key="' + form.getAttribute('name') + '"]')
  }
  return []
}

function __forms__validateRelated(relatedForms) {
  var idx, failed = 0
  for(idx = 0; idx < relatedForms.length; ++idx) {
    var relatedForm = relatedForms[idx],
      _existingOnsubmit = relatedForm.onsubmit
    relatedForm.onsubmit = function() {
      _existingOnsubmit()
      return false
    }
    relatedForm.onsubmit()
    relatedForm.onsubmit = _existingOnsubmit
    if(relatedForm.error || relatedForm.hasAttribute('error')) {
      ++failed
    }
    else if(!__forms__validate(relatedForm)) {
      ++failed
    }
  }
  return failed ? false : true
}

var ATTR_NAME = 'name'

function __forms__populateInstance(form, emeta) {
  /**
   * Run through all form control elements and copy those
   * matching to fields of the form's instance. Copying
   * needs 2 stages:
   * 1. Convert the form's string-only values to appropriate
   *    types as per the instance's model specification
   * 2. Copy the set of adapted field values through the
   *    validate and copy data function
  */
  var elements = form.elements,
    data = {},
    model = __forms__model(emeta)
  for(var idx = 0; idx < elements.length; ++idx) {
    var element = elements[idx],
      field = element.getAttribute(ATTR_NAME)
    if(field && field in model.def) {
      data[field] = __forms_formFieldToInstanceField(
        model.name, field, model.def[field], element.value)
      if('' === data[field] && model.def[field].blankIsNull) {
        data[field] = null
      }
    }
  }
  iparse__validateData(model.name, model.def, data, emeta.$i)
  adapters__run(ns.ADAPTER_TUNE_INSTANCE, form, emeta.$i)
  console.info('Setu.forms $ instance', form, emeta.$i)
}

var MODEL_DEF_STR_TYPES = [
  MODEL_DEF_TYPE_STRING,
  MODEL_DEF_TYPE_DATETIME,
  MODEL_DEF_TYPE_DATE,
  MODEL_DEF_TYPE_TIME,
  MODEL_DEF_TYPE_UUID
]

function __forms_formFieldToInstanceField(modelName, field, fieldDef, value) {
  var fieldType = mparse__fieldType(modelName, field, fieldDef)
  switch(fieldType) {
  case MODEL_FIELD_TYPE_PK:
    return __forms__evalIfNonString(fieldDef.type, value)
  case MODEL_FIELD_TYPE_PRIMITIVE:
    if('' === value && fieldDef.blankIsNull) {
      return null
    }
    return __forms__evalIfNonString(fieldDef.type, value)
  case MODEL_FIELD_TYPE_FK:
    if('' === value && fieldDef.blankIsNull) {
      return null
    }
    var related = models__get(fieldDef.fk),
      relatedPk = related.pks[0]
    return __forms_formFieldToInstanceField(related.name,
      relatedPk, related.def[relatedPk], value)
  case MODEL_FIELD_TYPE_ARRAY:
    return eval(value)
  }
}

function __forms__evalIfNonString(type, value) {
  return !MODEL_DEF_STR_TYPES.contains(type) ? eval(value) : value
}

function __forms__copyRelated(form, emeta, relatedForms) {
  /* Reset earlier copies of related form's instances */
  if(relatedForms.length) {
    __forms__resetRelatedAs(form, emeta,
      relatedForms[0].getAttribute(FORM_RELATED_AS))
  }
  for(var idx = 0; idx < relatedForms.length; ++idx) {
    var relatedForm = relatedForms[idx],
      emetaRelForm = emeta__get(relatedForm)
    __forms__populateInstance(relatedForm, emetaRelForm)
    __forms__copyRelatedToInstance(relatedForm, emetaRelForm, form, emeta)
  }
}

function __forms__resetRelatedAs(form, emeta, relatedAs) {
  var model = __forms__model(emeta),
    fieldDef = model.def[relatedAs],
    instance = emeta.$i
  if(__forms__isFkArray(model.name, relatedAs, fieldDef)) {
    instance[relatedAs].splice(0, instance[relatedAs].length)
    instance[relatedAs] = []
  } else {
    instance[relatedAs] = undefined
  }
}

function __forms__isFkArray(modelName, relatedAs, fieldDef) {
  var fieldType = mparse__fieldType(modelName, relatedAs, fieldDef)
  if(MODEL_FIELD_TYPE_ARRAY === fieldType) {
    var arrFieldType = mparse__arrayFieldType(modelName, relatedAs, fieldDef.elements)
    return MODEL_FIELD_TYPE_FK == arrFieldType
  }
  return false
}

function __forms__copyRelatedToInstance(relatedForm, emetaRelForm, form, emeta) {
  var relatedAs = relatedForm.getAttribute(FORM_RELATED_AS),
    relatedInstance = emetaRelForm.$i,
    imetaRelated = imeta__get(relatedInstance),
    instance = emeta.$i,
    imeta = imeta__get(instance),
    data = imetaRelated.$d ?
      instances__updateData(relatedInstance, imetaRelated) :
      instances__createData(relatedInstance, imetaRelated)
  if(data) {
    if(imetaRelated.$d) {
      imetaRelated.$m.pks.forEach(function(pk) {
        data[pk] = relatedInstance[pk]
      })
    }
    if(utils__isArray(instance[relatedAs])) {
      if(imeta.$d) {
        imeta.$c[relatedAs].newVal.push(data)
      } else {
        instance[relatedAs].push(data)
      }
    } else {
      instance[relatedAs] = data
    }
  }
}

function __forms__copyQueryParams(form, emeta) {
  if(form.hasAttribute(META_PARAMS)) {
    var imeta = imeta__get(emeta.$i)
    imeta.$qp = form.getAttribute(META_PARAMS)
  }
}

function __forms__resetAll(form, emeta, relatedForms) {
  if(form.hasAttribute(META_MODEL)) {
    // need to create a new instance now
    __forms__renewInstance(emeta)
    // reset related forms
    for(var idx = 0; idx < relatedForms.length; ++idx) {
      var relatedForm = relatedForms[idx],
        emetaRelForm = emeta__get(relatedForm)
      if(relatedForm.hasAttribute(META_MODEL)) {
        __forms__renewInstance(emetaRelForm)
      }
    }
  }
}

function __forms__renewInstance(emeta) {
  emeta.$i = models__createInstance(__forms__model(emeta))
}

function __forms__model(emeta) {
  return models__get(emeta.$i.__model__)
}
