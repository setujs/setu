( /* eslint-disable complexity */ /* eslint-disable max-statements */ /* eslint-disable no-shadow-restricted-names */
  function(ns, undefined) {
    /* eslint-enable complexity */
    /* eslint-enable max-statements */ /* eslint-enable no-shadow-restricted-names */
    /* eslint-disable no-extend-native */

    Array.prototype.contains = function(element) {
      return (-1 !== this.indexOf(element))
    }

    Array.prototype.remove = function(element, howMany) {
      var idx
      if (-1 !== (idx = this.indexOf(element))) {
        this.splice(idx, howMany || 1)
      }
    }

    Object.keys = Object.keys || function(obj) {
      var keys = []
      for (var key in obj) {
        keys.push(key)
      }
      return keys
    }

    /* eslint-enable no-extend-native */

    function utils__isArray(v) {
      return ('[object Array]' === Object.prototype.toString.call(v))
    }

    function utils__isObject(v) {
      return ('object' === typeof(v) && !utils__isArray(v))
    }

    function utils__shuntEvent(e) {
      if (e.preventDefault) {
        e.preventDefault()
      }
      if (e.stopPropagation) {
        e.stopPropagation()
      }
    }

    if (typeof Object.assign != 'function') {
      Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) {
          if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object')
          }
          var to = Object(target)
          for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index]
            if (nextSource != null) {
              for (var nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                  to[nextKey] = nextSource[nextKey]
                }
              }
            }
          }
          return to
        },
        writable: true,
        configurable: true
      })
    }

    if ('function' !== typeof(document.querySelector)) {
      consoleError('Setu.env ! document.querySelector not supported')
      throw new Error(MSG_NO_SUPPORT)
    }

    if ('function' !== typeof(document.querySelectorAll)) {
      consoleError('Setu.env ! document.querySelectorAll not supported')
      throw new Error(MSG_NO_SUPPORT)
    }

    if (!window.history ||
      'function' === typeof(!window.history.pushState) ||
      'function' === typeof(!window.history.popState)) {
      consoleError('Setu.env ! no support for browsing history update')
      throw new Error(MSG_NO_SUPPORT)
    }

    var MutationObserver = window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver

    if (!MutationObserver) {
      consoleError('Setu.env ! no MutationObserver support in browser')
      throw new Error(MSG_NO_SUPPORT)
    }

    if ('function' !== typeof(Object.create)) {
      consoleError('Setu.env ! Object.create not supported')
      throw new Error(MSG_NO_SUPPORT)
    }

    var
      CONTENT_TYPE_JSON = 'application/json; charset=UTF-8',

      NODE_TYPE_ELEMENT = 1, // ELEMENT_NODE
      NODE_TYPE_TEXT = 3, // TEXT_NODE
      NODE_TYPE_COMMENT = 8, // COMMENT_NODE

      METHOD_GET = 'GET',
      METHOD_POST = 'POST',
      METHOD_PATCH = 'PATCH',
      METHOD_PUT = 'PUT',
      METHOD_DELETE = 'DELETE',

      RESERVED_MODEL_FIELDS = ['__model__', '__key__'],

      ELEM_META_ATTR = '__sc',

      MODEL_DEF_PARAM_AUTO = 'auto',
      MODEL_DEF_PARAM_FK = 'fk',
      MODEL_DEF_PARAM_ELEMENTS = 'elements',
      MODEL_DEF_PARAM_NULL = 'null',
      MODEL_DEF_PARAM_OPTIONAL = 'optional',
      MODEL_DEF_PARAM_BLANK_IS_NULL = 'blankIsNull',
      MODEL_DEF_PARAM_PK = 'pk',
      MODEL_DEF_PARAM_TYPE = 'type',

      MODEL_DEF_TYPE_BOOLEAN = 'boolean',
      MODEL_DEF_TYPE_DATE = 'date',
      MODEL_DEF_TYPE_DATETIME = 'datetime',
      MODEL_DEF_TYPE_DECIMAL = 'decimal',
      MODEL_DEF_TYPE_INTEGER = 'integer',
      MODEL_DEF_TYPE_STRING = 'string',
      MODEL_DEF_TYPE_TIME = 'time',
      MODEL_DEF_TYPE_UUID = 'uuid',

      ALLOWED_FK_PARAMS = [
        MODEL_DEF_PARAM_BLANK_IS_NULL,
        MODEL_DEF_PARAM_FK,
        MODEL_DEF_PARAM_NULL,
      ],
      ALLOWED_PRIMITIVE_TYPES = [
        MODEL_DEF_TYPE_BOOLEAN,
        MODEL_DEF_TYPE_DATE,
        MODEL_DEF_TYPE_DATETIME,
        MODEL_DEF_TYPE_DECIMAL,
        MODEL_DEF_TYPE_INTEGER,
        MODEL_DEF_TYPE_STRING,
        MODEL_DEF_TYPE_TIME,
        MODEL_DEF_TYPE_UUID
      ],
      ALLOWED_PRIMITIVE_PARAMS = [
        MODEL_DEF_PARAM_BLANK_IS_NULL,
        MODEL_DEF_PARAM_NULL,
        MODEL_DEF_PARAM_OPTIONAL,
        MODEL_DEF_PARAM_TYPE,
      ],
      ALLOWED_PK_PARAMS = [
        MODEL_DEF_PARAM_AUTO,
        MODEL_DEF_PARAM_PK,
        MODEL_DEF_PARAM_TYPE,
      ],
      ALLOWED_ARRAY_PARAMS = [
        MODEL_DEF_PARAM_BLANK_IS_NULL,
        MODEL_DEF_PARAM_ELEMENTS,
        MODEL_DEF_PARAM_OPTIONAL,
        MODEL_DEF_PARAM_TYPE,
      ],
      ALLOWED_ARRAY_PRIMITIVE_PARAMS = [
        MODEL_DEF_PARAM_NULL,
        MODEL_DEF_PARAM_TYPE,
      ],

      MODEL_FIELD_TYPE_ARRAY = 'array',
      MODEL_FIELD_TYPE_FK = 'fk',
      MODEL_FIELD_TYPE_PK = 'pk',
      MODEL_FIELD_TYPE_PRIMITIVE = 'primitive',

      MODEL_CONF_UL_FIELDS = 'fields',
      MODEL_CONF_UL_FILTERS = 'filters',
      MODEL_CONF_UL_INSTANCE_FKS = 'instanceFks',
      MODEL_CONF_UL_REVERSE_FK_FILTERS = 'relFilters',

      /**
       * 0: whole regex
       *
       * 1: ({([a-z][0-9a-zA-Z_]*)})
       *      - title enclosed in { }
       *
       * 2: ([a-z][0-9a-zA-Z_]*)
       *      - title
       *
       * 3: ([A-Za-z][0-9a-zA-Z_]+)
       *      - model name
       *
       * 4: (:(([^,:|=]+)|([a-z][0-9a-zA-Z_]*=[^,:|=]+(,[a-z][0-9a-zA-Z_]*=[^,:|]+)*)))
       *      - primary key definition starting with ':'
       *
       * 5: (([^,:|=]+)|([a-z][0-9a-zA-Z_]*=[^,:|=]+(,[a-z][0-9a-zA-Z_]*=[^,:|]+)*))
       *      - primary key definition
       *
       * 6: ([^,:|=]+)
       *      - if the 1st variation of primary key was used e.g. ModelName:2314
       *
       * 7: ([a-z][0-9a-zA-Z_]*=[^,:|=]+(,[a-z][0-9a-zA-Z_]*=[^,:|]+)*)
       *      - if the 2nd variation of primary key was used e.g. ModelName:a=2,b=3
       *
       * 8: (,[a-z][0-9a-zA-Z_]*=[^,:|]+)*
       *      - optional part of the 2nd variation e.g. ,b=3 in above example
       *
       * 9: (\|([a-z][0-9a-zA-Z_]*=[^,]+(,[a-z][0-9a-zA-Z_]*=[^,]+)*)+)
       *      - filter definition preceded by '|'
       *
       * 10: ([a-z][0-9a-zA-Z_]*=[^,]+(,[a-z][0-9a-zA-Z_]*=[^,]+)*)
       *      - filter definition
       *
       * 11: (,[a-z][0-9a-zA-Z_]*=[^,]+)*
       *      - ',<filter>' repetitions after 1st filter
       *
       * [2] -> title | undefined
       * [3] -> model
       * [5] -> primary key | undefined
       * [10] -> params/filter | undefined
       *
       * key = [3] + (':' + [5]) + ('|' + [10])
       */
      REGEX_RESOURCE =
      /^({([a-z][0-9a-zA-Z_]*)})?([A-Za-z][0-9a-zA-Z_]+)(:(([^,:|=]+)|([a-z][0-9a-zA-Z_]*=[^;:|=]+(;[a-z][0-9a-zA-Z_]*=[^;:|]+)*)))?(\|([a-z][0-9a-zA-Z_]*=[^;=]+(;[a-z][0-9a-zA-Z_]*=[^;=]+)*))?$/,

      REGEX_TEMPLATE = /({{[^{}]+}})/g,
      REGEX_TRUTHY_TEMPLATE = /({%{[^{}]+}%})/g,

      REGEX_META_ATTRIB = /^setu\-([a-z])([a-z]+)$/,
      REGEX_LOOP =
      /([a-zA-Z][a-zA-Z0-9_\.]*)[\s]*in[\s]*([a-zA-Z][a-zA-Z0-9_\.]+)/,
      REGEX_DECLARE = /([a-zA-Z][a-zA-Z0-9_]*)[\s]*=[\s]*(.*)+/,
      REGEX_LIST = /^list::([A-Za-z][A-Za-z0-9_]+)(\|([a-z][0-9a-zA-Z_]*=[^,=]+(,[a-z][0-9a-zA-Z_]*=[^,=]+)*))?$/,
      REGEX_CREATE = /^create::([A-Z][A-Za-z0-9_]+)$/,

      REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      REGEX_DATETIME = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])[T ](0\d|1\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\.\d+)?(Z|[+-](0\d|1[0-2]):?[0-5]\d)?$/,
      REGEX_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      REGEX_TIME = /^(0\d|1\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\.\d+)?(Z|[+-](0\d|1[0-2]):?[0-5]\d)?$/,

      PK_TYPE_ONE = 'one',
      PK_TYPE_MULTI = 'multi',

      META_APP = 'setu-app',
      META_BIND = 'setu-bind',
      META_CLICK = 'setu-click',
      META_DELETE_CALLBACK = 'setu-delete-callback',
      META_DELETE_PARAM = 'setu-delete-param',
      META_DECLARE = 'setu-declare',
      META_IF = 'setu-if',
      META_INCLUDE = 'setu-include',
      META_INSTANCE = 'setu-instance',
      META_LOOP = 'setu-loop',
      META_MODEL = 'setu-model',
      META_PASS = 'setu-pass',
      META_REQUIRE = 'setu-require',
      META_REPLACE = 'setu-replace',
      META_PARAMS = 'setu-params',
      META_PAGESIZE = 'setu-pagesize',
      META_PAGESET = 'setu-pageset',
      META_FILTER = 'setu-filter',
      META_ATTRIBUTES = [
        META_BIND, META_CLICK,
        META_DECLARE, META_IF,
        META_INCLUDE, META_INSTANCE,
        META_LOOP, META_MODEL,
        META_PASS, META_REQUIRE,
        META_PAGESIZE, META_PAGESET,
        META_FILTER,
      ],

      META_CONTENT = 'setu-content',

      FILTER_PARAM = 'filter-param',

      FORM_RELATED_AS = 'related-as',

      KW_API = 'api',
      KW_LIST = 'list',
      KW_DETAIL = 'detail',
      KW_CREATE = 'create',
      KW_UPDATE = 'update',
      KW_DELETE = 'delete',
      KW_MODEL = 'model',
      KW_INSTANCE = 'instance',
      KW_CODE = 'code',

      PARSE_FALL_THROUGH = 'parseFallThrough',
      PARSE_DONE = 'parseDone',
      PARSE_PENDING = 'parsePending',
      PARSE_ERROR = 'parseError',
      PARSE_REMOVED = 'parseRemoved',
      PARSE_REPLACED = 'parseReplaced',

      MSG_BADLY_CONFIGURED = 'Improperly configured Setu application',
      MSG_INVALID_INSTANCE_DATA = 'Invalid instance data',
      MSG_INVALID_META = 'Invalid Setu meta syntax',
      MSG_INTERNAL_ERROR = 'Setu internal error',
      MSG_NO_SUPPORT = 'This browser does not support the Setu framework'

    var temp = []
    META_ATTRIBUTES.forEach(function(attr) {
      temp.push('[' + attr + ']')
    })

    var META_ATTRS_SELECTOR = temp.join(',')

    ns.MULTI_PK_TO_URL_KEY_VALUE_PATH = 'KeyValuePath'
    ns.MULTI_PK_TO_URL_ORDERED_VALUES_PATH = 'OrderedValuesPath'
    ns.MULTI_PK_TO_URL_ORDERED_SEPERATED_VALUES = 'OrderedSeparatedValues'

    ns.EVENT_LIST_RESOURCE_CREATE = 'listResourceCreate'
    ns.EVENT_LIST_RESOURCE_CHANGE = 'listResourceChange'
    ns.EVENT_LIST_RESOURCE_DELETE = 'listResourceDelete'
    ns.EVENT_DETAIL_RESOURCE_CHANGE = 'detailResourceChange'
    ns.EVENT_DETAIL_RESOURCE_DELETE = 'detailResourceDelete'
    ns.EVENT_INSTANCE_CHANGE = 'instanceChange'
    ns.EVENT_INSTANCE_CREATE = 'instanceCreate'
    ns.EVENT_INSTANCE_DELETE = 'instanceDelete'
    ns.EVENT_META_RENDER = 'metaRender'
    ns.EVENT_PAGE_BEGIN = 'pageBegin'
    ns.EVENT_PAGE_RENDER = 'pageRender'
    ns.EVENT_FRAGMENT_CHANGE = 'fragmentChange'
    ns.EVENT_FORM_SUCCESS = 'formSuccess'
    ns.EVENT_FORM_ERROR = 'formError'
    ns.EVENT_AJAX_ERROR = 'ajaxError'

    ns.ADAPTER_AJAX_BEFORE_SEND = 'ajaxBeforeSend'
    ns.ADAPTER_AJAX_ON_RESPONSE = 'ajaxOnResponse'
    ns.ADAPTER_MODELS_LIST = 'modelsList'
    ns.ADAPTER_FILTER_VALUE = 'filterValue'
    ns.ADAPTER_VALIDATE_FORM = '__forms__validate'
    ns.ADAPTER_TUNE_INSTANCE = 'tuneInstance'

    ns.PAGE_PARAM = 'page'
    ns.PAGE_SIZE_PARAM = 'page_size'

    var GLogLevels = {
      'error': 1,
      'warn': 2,
      'info': 3,
      'log': 4,
    }

    var GLogLevel = GLogLevels.log

    function __log__dummy() {}

    console.debug = console.debug || __log__dummy

    console.time = console.time || __log__dummy
    console.timeEnd = console.timeEnd || __log__dummy

    var consoleTime = console.time || __log__dummy
    var consoleTimeEnd = console.timeEnd || __log__dummy
    var consoleInfo = console.info || __log__dummy
    var consoleWarn = console.warn || __log__dummy
    var consoleError = console.error || __log__dummy

    function log__setLevel(level) {
      if (GLogLevels[level]) {
        GLogLevel = GLogLevels[level]
      }
      for (level in GLogLevels) {
        if (GLogLevels[level] <= GLogLevel) {
          console[level] = console[level] || __log__dummy
        } else {
          console[level] = __log__dummy
        }
      }
      consoleTime = __log__setupDummy('time', 'error')
      consoleTimeEnd = __log__setupDummy('timeEnd', 'error')
      console.time = __log__setupDummy('time', 'error')
      console.timeEnd = __log__setupDummy('timeEnd', 'error')
      consoleInfo = console.info
      consoleWarn = console.warn
      consoleError = console.error
      console.debug('Setu.log', 'level', GLogLevel)
    }

    function __log__setupDummy(member, against) {
      return (console[member] && __log__dummy !== console[against] ?
        console[member] :
        __log__dummy)
    }

    var GAdapters = {}

    function adapters__register(purpose, procedure, context) {
      GAdapters[purpose] = GAdapters[purpose] || []
      GAdapters[purpose].push([context, procedure])
      console.debug('Setu.adapters +', purpose, context, procedure)
    }

    function adapters__run(purpose) {
      if (!GAdapters[purpose]) {
        return []
      }
      /**
       * It's called as follows:
       * adapters__run(purpose, arg0, arg1, arg2, ...)
       *
       * The 'arguments' var is sliced into an array and 0th
       * item is replaced with the context of each registry.
       * The registered adapter procedure is called as follows:
       * procedure(context, arg0, arg1, arg2, ...)
       */
      var args = Array.prototype.slice.apply(arguments),
        results = []
      GAdapters[purpose].forEach(function(registry) {
        args[0] = registry[0]
        results.push(registry[1].apply(null, args))
      })
      console.info('Setu.adapters >', purpose, results)
      return results
    }

    /* The global adapters registry */
    ns.adapters = {}

    var
      GEventsConsumers = {},
      GEventsKeyedConsumers = {}

    GEventsConsumers[ns.EVENT_LIST_RESOURCE_CREATE] = []
    GEventsConsumers[ns.EVENT_FORM_SUCCESS] = []
    GEventsConsumers[ns.EVENT_FORM_ERROR] = []
    GEventsConsumers[ns.EVENT_AJAX_ERROR] = []
    GEventsConsumers[ns.EVENT_PAGE_RENDER] = []
    GEventsConsumers[ns.EVENT_PAGE_BEGIN] = []
    GEventsConsumers[ns.EVENT_META_RENDER] = []
    GEventsConsumers[ns.EVENT_FRAGMENT_CHANGE] = []

    GEventsKeyedConsumers[ns.EVENT_DETAIL_RESOURCE_CHANGE] = {}
    GEventsKeyedConsumers[ns.EVENT_DETAIL_RESOURCE_DELETE] = {}
    GEventsKeyedConsumers[ns.EVENT_INSTANCE_CHANGE] = {}
    GEventsKeyedConsumers[ns.EVENT_INSTANCE_CREATE] = {}
    GEventsKeyedConsumers[ns.EVENT_INSTANCE_DELETE] = {}
    GEventsKeyedConsumers[ns.EVENT_LIST_RESOURCE_CHANGE] = {}
    GEventsKeyedConsumers[ns.EVENT_LIST_RESOURCE_DELETE] = {}

    /**
     * Event registries (non-keyed and keyed) look as follows:
     * [cookie0, handler0, cookie1, handler1, cookie2, handler2, ...]
     */


    function events__register(type, handler, cookie) {
      if (!GEventsConsumers[type].contains(cookie)) {
        GEventsConsumers[type].push(cookie)
        GEventsConsumers[type].push(handler)
        console.debug('Setu.events +', type, cookie, handler)
      }
    }

    function events__registerFrom(type, key, handler, cookie) {
      GEventsKeyedConsumers[type][key] = GEventsKeyedConsumers[type][key] || []
      if (!GEventsKeyedConsumers[type][key].contains(cookie)) {
        GEventsKeyedConsumers[type][key].push(cookie)
        GEventsKeyedConsumers[type][key].push(handler)
        console.debug('Setu.events +', type, key, cookie, handler)
      }
    }

    function events__fire(type, producer, data) {
      /**
       * An event subscriber can unsubscribe within the event handler.
       * Hence a copy of the registry array is used for calling all the
       * registered handlers.
       */
      var registry = GEventsConsumers[type].slice()
      for (var i = 0; i < registry.length; i += 2) {
        /**
         * Event handlers may throw exceptions. That should not prevent
         * calling all subsequent event handlers. Hence, all exceptions
         * are intercepted.
         */
        try {
          console.info('Setu.events -->', type, producer, data, registry[i],
            registry[i + 1])
          /**
           * The event handler is called as follows:
           * handler(cookie, producer, data)
           */
          registry[i + 1](registry[i], producer, data)
        } catch (e) {
          console.warn('Setu.events !', type, producer, data, e.message, e.stack)
        }
      }
    }

    function events__fireTo(type, key, producer, data) {
      var registry = GEventsKeyedConsumers[type][key]
      if (registry) {
        registry = registry.slice()
        for (var i = 0; i < registry.length; i += 2) {
          try {
            console.info('Setu.events -->', type, key, producer, data, registry[i],
              registry[i + 1])
            registry[i + 1](registry[i], producer, data)
          } catch (e) {
            console.warn('Setu.events !', type, key, producer, data, e.message, e.stack)
          }
        }
      }
    }

    function events__unregister(type, cookie) {
      GEventsConsumers[type].remove(cookie, 2)
      console.debug('Setu.events x', type, cookie)
    }

    function events__unregisterFrom(type, key, cookie) {
      var registry = GEventsKeyedConsumers[type][key]
      if (registry) {
        registry.remove(cookie, 2)
        console.debug('Setu.events x', type, key, cookie)
      }
    }

    ns.register = events__register
    ns.unregister = events__unregister

    var GWindow = window,
      GSetVars = {},
      GEvent

    function evals__clear() {
      for (var key in GSetVars) {
        delete GSetVars[key]
      }
      GSetVars = {}
      GEvent = undefined
      console.debug('Setu.evals x all', GSetVars)
    }

    function evals__set(key, value) {
      GSetVars[key] = value
    }

    function evals__add(object) {
      var setVals = {}
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          if (!GSetVars.hasOwnProperty(key) || GSetVars[key] !== object[key]) {
            var value = object[key]
            evals__set(key, value)
            setVals[key] = value
          }
        }
      }
      return setVals
    }

    function __evals__addToWindow() {
      GEvent = GWindow.event
      for (var key in GSetVars) {
        GWindow[key] = GSetVars[key]
      }
      console.debug('Setu.evals + window', Object.assign({}, GSetVars))
    }

    function __evals__removeFromWindow() {
      for (var key in GSetVars) {
        if (GWindow.hasOwnProperty(key)) {
          delete GWindow[key]
        }
      }
      GWindow.event = GEvent
      console.debug('Setu.evals x window', Object.assign({}, GSetVars))
    }

    function __evals__unset(resources) {
      for (var key in resources) {
        if (resources.hasOwnProperty(key)) {
          delete GSetVars[key]
        }
      }
    }

    /* eslint-disable no-eval */

    function evals__doTemplate(resources, expr) {
      var setVals = evals__add(resources)
      __evals__addToWindow()
      /**
       * Template strings have these formats:
       * expr
       * expr | filter0 | filter1
       * The 2nd example is evaluated as: filter1(filter0(eval(expr)))
       */
      var ret = expr.replace(REGEX_TEMPLATE, function(match) {
        return __evals__evalTemplateMatch(match)
      })
      ret = ret.replace(REGEX_TRUTHY_TEMPLATE, function(match) {
        return __evals__evalTemplateMatch(match, true)
      })
      __evals__removeFromWindow()
      __evals__unset(setVals)
      /**
       * The return value is the original expression itself in case of failure.
       * This would lead to ongoing meta parsing step to fail in rendering the
       * page properly giving a visual cue to the developer. They can further
       * check the console to find out issues with the syntax then.
       */
      return ret
    }

    function __evals__evalTemplateMatch(match, truthy) {
      /**
       * Remove the template begin and end braces from matched template string.
       * Remove whitespace before and after '|' to allow splitting the template
       * expression around it.
       * Remove all whitespace from beginning and end of template string.
       */
      var parsed
      if (!truthy) {
        parsed = match.replace(/^{{/, '').replace(/}}$/, '')
      } else {
        parsed = match.replace(/^{!{/, '').replace(/}!}$/, '')
      }
      parsed = parsed.replace(/\s*\|\s*/, '|').trim()
      parts = parsed.split('|')
      try {
        var val = __evals__evalPipe(parts)
        if (!truthy) {
          /**
           * If <undefined> is returned by the above function, it indicates
           * a failure due to template string config of any nature. In that
           * case, this function returns the matched string component itself
           * indicating the caller of this a failure in eval'ing the expression
           * passed to this function.
           */
          return undefined !== val ? val : match
        } else {
          /**
           * For truthy templates, only truthy works!
           */
          return val ? val : match
        }
      } catch (e) {
        console.debug('Setu.evals ! template', match, parts, e.message, e.stack)
        /**
         * Any failure in evaling pipe-separated template expression
         * is indicated to the caller by returning the matched string component
         * itself implying it could not be parsed or eval'd
         */
        return match
      }
    }

    function __evals__evalPipe(parts) {
      /**
       * For parts of a template expression separated by pipes e.g.
       * expr | filter0 | filter1
       * and to achieve the result: filter1(filter0(eval(expr)))
       * The relevant steps are tried and in case any of them results
       * in an error in template string configuration or eval, this
       * function returns <undefined> to notify the caller of this
       * function of such an error condition.
       */
      var val = eval(parts[0])
      if (undefined === val) {
        console.debug('Setu.evals ! eval piped', parts[0])
        return undefined
      }
      for (var i = 1; i < parts.length; ++i) {
        var part = parts[i]
        if (filters__exists(part)) {
          val = filters__run(part, val)
        } else {
          console.debug('Setu.evals ! eval not-a-filter', part)
          return undefined
        }
        if (undefined === val) {
          console.debug('Setu.evals ! eval piped-filter', part)
          return undefined
        }
      }
      return val
    }

    function evals__doExpr(resources, expr) {
      var setVals = evals__add(resources)
      __evals__addToWindow()
      /**
       * This function is used to typically eval expressions associated
       * with meta attrs like loop, if and declare. Some
       * times, these expressions can be templates implying use of context
       * variables. Other times, these could be ready-to-eval javascript
       * expression strings. This function caters to both scenarios.
       */
      var result
      try {
        if (!syn__isTemplate(expr)) {
          /* Ready-to-eval javascript expression scene */
          result = eval(expr)
        } else {
          /**
           * Expression is a template, so first reduce it to the
           * result of parsing the template, and then eval it assuming
           * the template parsing resulted in a ready-to-eval javascript
           * expression string.
           * Since the resources to be available in runtime are already
           * in the runtime by calling evals__add above, the call to
           * evals__doTemplate is made with empty set of resources, as there
           * are no more resources to make available in runtime.
           */
          result = eval(evals__doTemplate({}, expr))
        }
      } catch (e) {
        console.debug('Setu.evals ! expr', expr, e.message, e.stack)
        /**
         * Failure in eval'ing an expression is indicated by returing the
         * original expression itself. This would ensure that the ongoing
         * Setu meta parsing would not render the page properly indicating
         * failures visually. A developer can see the console then to know
         * the reason of rendering failure.
         */
        result = expr
      }
      __evals__removeFromWindow()
      __evals__unset(setVals)
      return result
    }

    /* eslint-enable no-eval */

    ns.set = function(key, value) {
      evals__set(key, value)
      __evals__addToWindow()
    }

    function __filters__datetime(dateStr) {
      return (new Date(dateStr)).toISOString()
    }

    function filters__exists(filter) {
      return filter in GFilters
    }

    function filters__run(filter, input) {
      return GFilters[filter](input)
    }

    var GFilters = {
      datetime: __filters__datetime
    }

    var GHistoryChange, GLast

    window.onpopstate = function(e) {
      if (e.state && e.state.pathname) {
        if (!__history__onlyFragmentChange(e.state, GLastUrl || {})) {
          GHistoryChange = e.state
          console.info('Setu.history popstate', e.state, GLastUrl)
          app__navigate()
        } else {
          events__fire(ns.EVENT_FRAGMENT_CHANGE, ns)
        }
        __history__rememberLastUrl()
      }
    }

    function __history__onlyFragmentChange(path1, path2) {
      return path1.pathname === path2.pathname && path1.search === path2.search
    }

    function __history__parsePath(path) {
      var fragment = path.match(/#/) ? path.replace(/^.*#/g, '#') : "",
        fragmentLess = fragment ? path.replace(/#.*$/g, '') : path,
        search = fragmentLess.match(/\?/) ? fragmentLess.replace(/^.*\?/g, '?') : "",
        pathname = search ? fragmentLess.replace(/\?.*$/g, '') : fragmentLess
      return {
        pathname: pathname,
        search: search,
        fragment: fragment
      }
    }

    function history__addFragment(fragment) {
      history__push(window.location.pathname + window.location.search + '#' + fragment, {
        pathname: window.location.pathname,
        search: window.location.search,
        fragment: '#' + fragment
      })
      console.info('Setu.history #', fragment)
    }

    function history__push(path, parsedPath) {
      parsedPath = parsedPath || __history__parsePath(path)
      window.history.pushState(parsedPath, '', path)
      __history__rememberLastUrl()
      console.info('Setu.history push', parsedPath)
    }

    function history__replace(path) {
      var parsedPath = __history__parsePath(path)
      window.history.replaceState(parsedPath, '', path)
      __history__rememberLastUrl()
      console.info('Setu.history replace', parsedPath)
    }

    function history__changedPath() {
      return GHistoryChange && GHistoryChange.pathname ? GHistoryChange.pathname : null
    }

    function history__eraseChange() {
      GHistoryChange = null
    }

    function __history__rememberLastUrl() {
      GLastUrl = {
        pathname: window.location.pathname,
        search: window.location.search,
        fragment: window.location.hash
      }
    }

    history__push(window.location.pathname + window.location.search + window.location.hash, {
      pathname: window.location.pathname,
      search: window.location.search,
      fragment: window.location.hash
    })

    ns.fragment = history__addFragment

    var GHttpGetQueue = {}

    function http__clear() {
      GHttpGetQueue = {}
    }

    function __http__ajax(method, url, options, onsuccess, onerror) {
      options = options || {}
      options.method = method || METHOD_GET
      options.cache = options.cache || false
      options.beforeSend = options.beforeSend || function(xhr, settings) {
        __http__ajaxStart()
        adapters__run(ns.ADAPTER_AJAX_BEFORE_SEND, xhr, settings, this)
      }
      __http__setupSuccessFn(options, url, method, onsuccess)
      __http__setupErrorFn(options, url, method, onerror)
      console.debug('Setu.http -->', url, options)
      $_.ajax(url, options)
    }

    function __http__setupSuccessFn(options, origUrl, method, onsuccess) {
      options.success = function(data, status, url, xhr) {
        console.info('Setu.http ajax $', url, method, status, data)
        __http__ajaxEnd()
        try {
          adapters__run(ns.ADAPTER_AJAX_ON_RESPONSE, data, status, url, xhr)
        } catch (e) {
          console.warn('Setu.http ! success adapters__run', e.message, e.stack)
        }
        try {
          if ('function' === typeof(onsuccess)) {
            onsuccess({
              data: data,
              status: status,
              xhr: xhr,
              url: url
            })
          }
          if (METHOD_GET === method && origUrl in GHttpGetQueue) {
            GHttpGetQueue[origUrl].forEach(function(fetcher) {
              if ('function' === typeof(fetcher.onsuccess)) {
                fetcher.onsuccess({
                  data: data,
                  status: status,
                  xhr: xhr,
                  url: url
                })
              }
            })
            delete GHttpGetQueue[origUrl]
          }
        } catch (e) {
          consoleError('Setu.http ! error onsuccess', e.message, e.stack)
          if (METHOD_GET === method) {
            delete GHttpGetQueue[origUrl]
          }
        }
      }
    }

    function __http__setupErrorFn(options, origUrl, method, onerror) {
      options.error = function(err, status, url, xhr) {
        consoleError('Setu.http ajax !', url, method, status, err)
        __http__ajaxEnd()
        try {
          adapters__run(ns.ADAPTER_AJAX_ON_RESPONSE, err, status, url, xhr)
        } catch (e) {
          console.warn('Setu.http ! error adapters__run', e.message, e.stack)
        }
        var jsonStr = JSON.stringify({
          status: status,
          error: err,
          url: url
        })
        try {
          if ('function' === typeof(onerror)) {
            onerror(Error(jsonStr))
          }
          if (METHOD_GET === method && origUrl in GHttpGetQueue) {
            GHttpGetQueue[origUrl].forEach(function(fetcher) {
              if ('function' === typeof(fetcher.onerror)) {
                fetcher.onerror(Error(jsonStr))
              }
            })
            delete GHttpGetQueue[origUrl]
          }
        } catch (e) {
          consoleError('Setu.http ! error onerror', e.message, e.stack)
          if (METHOD_GET === method) {
            delete GHttpGetQueue[origUrl]
          }
        }
        if ('number' !== typeof(status) || status < 400) {
          events__fire(ns.EVENT_AJAX_ERROR, null, {
            status: status,
            error: err
          })
        }
      }
    }

    function __http__ajaxStart() {
      if ('function' === typeof(ns.appAjaxStart)) {
        try {
          ns.appAjaxStart()
        } catch (e) {
          console.warn('Setu.http ! appAjaxStart', e.message, e.stack)
        }
      }
    }

    function __http__ajaxEnd() {
      if ('function' === typeof(ns.appAjaxEnd)) {
        try {
          ns.appAjaxEnd()
        } catch (e) {
          console.warn('Setu.http ! appAjaxEnd', e.message, e.stack)
        }
      }
    }

    function http__get(url, options, onsuccess, onerror) {
      if (GHttpGetQueue[url]) {
        GHttpGetQueue[url].push({
          onsuccess: onsuccess,
          onerror: onerror
        })
        return
      }
      GHttpGetQueue[url] = []
      __http__ajax(METHOD_GET, url, options, onsuccess, onerror)
    }

    function http__post(url, options, onsuccess, onerror) {
      __http__ajax(METHOD_POST, url, options, onsuccess, onerror)
    }

    function http__patch(url, options, onsuccess, onerror) {
      __http__ajax(METHOD_PATCH, url, options, onsuccess, onerror)
    }

    function http__put(url, options, onsuccess, onerror) {
      __http__ajax(METHOD_PUT, url, options, onsuccess, onerror)
    }

    function http__delete(url, options, onsuccess, onerror) {
      __http__ajax(METHOD_DELETE, url, options, onsuccess, onerror)
    }

    var GObserverRunning = false

    var GObserver = new MutationObserver(function(mutations) {
      __observer__process(mutations)
    })

    function observer__monitor(element) {
      if (element && document.body.contains(element)) {
        GObserver.observe(element, {
          childList: true,
          subtree: true
        })
      }
    }

    function observer__stop() {
      GObserver.disconnect()
    }

    function __observer__process(mutations) {
      GObserverRunning = false
      mutations.forEach(function(m) {
        if (m.addedNodes) {
          m.addedNodes.forEach(function(node) {
            if (NODE_TYPE_ELEMENT === node.nodeType && document.body.contains(node) && syn__existsIn(node)) {
              GObserverRunning = true
              console.debug('Setu.observer +', node)
              parser__parseElement(node)
            }
          })
        }
      })
      if (observer__running()) {
        if (parser__isDone()) {
          parser__endgame()
        }
        GObserverRunning = false
      }
    }

    function observer__running() {
      return GObserverRunning
    }

    var GRoutes,
      GCurrentRoute,
      GPath

    function routes__setup(routes) {
      GRoutes = routes
      routes__clear()
    }

    function routes__resolve(onsuccess) {
      __routes__findPath()
      var routeDef
      if (!(routeDef = routes__getDef(GPath))) {
        onsuccess()
        return
      }
      __routes__processDef(routeDef, onsuccess)
    }

    function routes__clear() {
      GCurrentRoute = GPath = undefined
      console.info('Setu.routes x all')
    }

    function routes__getDef(path) {
      if (GRoutes[path]) {
        return GRoutes[path]
      }
      for (var key in GRoutes) {
        if (path.match(new RegExp(key))) {
          return GRoutes[key]
        }
      }
      return false
    }

    function __routes__findPath() {
      var pathFromHistory = history__changedPath()
      if (pathFromHistory) {
        GPath = pathFromHistory
        history__eraseChange()
        console.info('Setu.routes history', GPath)
      } else {
        GPath = location.pathname.replace(/\/$/, '')
        console.info('Setu.routes location', GPath)
      }
    }

    function __routes__processDef(routeDef, onsuccess) {
      if ('function' === typeof(routeDef)) {
        routeDef(function(ret) {
          __routes__finish(ret, onsuccess)
        })
      } else {
        __routes__finish(routeDef, onsuccess)
      }
    }

    function __routes__finish(routeDef, onsuccess) {
      GCurrentRoute = routeDef
      console.info('Setu.routes $ resolve', GPath, GCurrentRoute)
      onsuccess()
    }

    function routes__exists() {
      return GCurrentRoute
    }

    function routes__toRedirect() {
      return GCurrentRoute.redirect
    }

    function routes__redirect() {
      return GCurrentRoute.redirect
    }

    function routes__toInclude() {
      return GCurrentRoute.include
    }

    function routes__include() {
      return GCurrentRoute.include
    }

    function routes__toFlush() {
      return GCurrentRoute.flush
    }

    function routes__require() {
      return GCurrentRoute.require
    }

    var GConfig

    function config__setup(config) {
      GConfig = config
      if (GConfig.logLevel) {
        log__setLevel(GConfig.logLevel)
      }
      if (GConfig.adapters) {
        GConfig.adapters.forEach(function(adapterGroup) {
          ns.adapters[adapterGroup].forEach(function(adapter) {
            adapters__register(adapter.purpose, adapter.handler)
          })
        })
      }
      console.debug('Setu.config $ setup')
    }

    function config__pathChangeFlush() {
      if (GConfig.pathchange && GConfig.pathchange.flush) {
        return GConfig.pathchange.flush
      }
      return undefined
    }

    ns.models = {}

    ns.models.NameResolutionDefault = {

      m2p: function(name) {
        /**
         * Converts model 'Test' to path 'tests', and 'TestQuestionAnswer'
         * to 'test-question-answers'
         */
        return (
          name.replace(/^([A-Z])/, function(v) {
            return v.toLowerCase()
          })
          .replace(/([A-Z])/g, function(v) {
            return '-' + v.toLowerCase()
          }) +
          's')
      },

      p2m: function(name) {
        /**
         * Reverses what m2p does
         */
        return (
          name.replace(/^([a-z])/, function(v) {
            return v.toUpperCase()
          })
          .replace(/(-[a-z])/g, function(v) {
            return v.charAt(1).toUpperCase()
          })
          .replace(/s$/, ''))
      },

      m2i: function(name) {
        /**
         * Maps model 'Test' to its instance variable name 'test', and
         * 'TestQuestionAnswer' to 'test_question_answer'
         */
        return (
          name.replace(/^([A-Z])/, function(v) {
            return v.toLowerCase()
          })
          .replace(/([A-Z])/g, function(v) {
            return '_' + v.toLowerCase()
          }))
      },

      i2m: function(name) {
        /**
         * Reverses what m2i does
         */
        return (
          name.replace(/^([a-z])/, function(v) {
            return v.toUpperCase()
          })
          .replace(/(_[a-z])/g, function(v) {
            return v.charAt(1).toUpperCase()
          }))
      },

      m2l: function(name) {
        /**
         * Maps model 'Test' to its list variable name 'tests', and
         * 'TestQuestionAnswer' to 'test_question_answers'
         */
        return (this.m2i(name) + 's')
      },

      l2m: function(name) {
        /**
         * Reverses what m2l does
         */
        return (this.i2m(name).replace(/s$/, ''))
      }
    }

    function mparse__defs(modelsDefs) {
      for (var modelName in modelsDefs) {
        if (modelsDefs.hasOwnProperty(modelName)) {
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
      for (var field in modelDef) {
        if (modelDef.hasOwnProperty(field)) {
          __mparse__validateFieldDef(modelsDefs, modelName, modelDef, field)
        }
      }
      return modelDef
    }

    function __mparse__getDef(modelsDefs, modelName) {
      var modelDef = modelsDefs[modelName]
      if (!utils__isObject(modelDef)) {
        consoleError('Setu.mparse !', modelName,
          'model definition must be an object', modelDef)
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
      return modelDef
    }

    function __mparse__ensureNoReservedKWs(modelName, modelDef) {
      RESERVED_MODEL_FIELDS.forEach(function(reserved) {
        if (reserved in modelDef) {
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
      switch (fieldType) {
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
      if (!utils__isObject(fieldDef)) {
        consoleError('Setu.mparse !', modelName, 'model field', field,
          'definition is not an object', fieldDef)
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
      return fieldDef
    }

    function mparse__fieldType(modelName, field, fieldDef) {
      __mparse__ensureTypeXorFk(modelName, field, fieldDef)
      return (MODEL_DEF_PARAM_TYPE in fieldDef ?
        MODEL_FIELD_TYPE_ARRAY !== fieldDef.type ?
        !(MODEL_DEF_PARAM_PK in fieldDef) ?
        MODEL_FIELD_TYPE_PRIMITIVE :
        MODEL_FIELD_TYPE_PK :
        MODEL_FIELD_TYPE_ARRAY :
        MODEL_FIELD_TYPE_FK)
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
      switch (type) {
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
      if (MODEL_DEF_PARAM_TYPE in fieldDef && MODEL_DEF_PARAM_FK in fieldDef) {
        consoleError('Setu.mparse !',
          'both "type" and "fk" are defined in', fieldDef,
          'in model', modelName, 'field', field)
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
      if (!(MODEL_DEF_PARAM_TYPE in fieldDef) && !(MODEL_DEF_PARAM_FK in fieldDef)) {
        consoleError('Setu.mparse !',
          'none of "type" and "fk" are defined in', fieldDef,
          'in model', modelName, 'field', field)
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
    }

    function __mparse__ensureFkModelExists(modelsDefs, modelName, field, fieldDef) {
      if (!(fieldDef.fk in modelsDefs)) {
        consoleError('Setu.mparse !',
          'model', fieldDef.fk, 'referred to in', fieldDef,
          'as a foreign key field', field, 'in model', modelName,
          'does not exist')
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
    }

    function __mparse__forbidUnallowedTypes(modelName, field, fieldDef, allowed) {
      if (!allowed.contains(fieldDef.type)) {
        consoleError('Setu.mparse !',
          'unsupported type', fieldDef.type,
          'in', fieldDef, 'in model', modelName,
          'field', field, 'allowed ones are:', allowed)
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
    }

    function __mparse__forbidSpuriousParams(modelName, field, fieldDef, allowed) {
      for (var key in fieldDef) {
        if (fieldDef.hasOwnProperty(key) && !allowed.contains(key)) {
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
      for (var field in modelDef) {
        if (modelDef.hasOwnProperty(field) && modelDef[field].pk) {
          pks.push(field)
        }
      }
      if (!pks.length) {
        consoleError('Setu.mparse !', 'model', modelName,
          'does not have any primary keys defined')
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
      return pks
    }

    function __mparse__extractFks(modelName, modelDef) {
      var fks = {}
      for (var field in modelDef) {
        if (modelDef.hasOwnProperty(field) && modelDef[field].fk) {
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
      for (var field in model.def) {
        if (model.def.hasOwnProperty(field)) {
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
      if (updateConf && instance) {
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
      if (!GModels[modelName]) {
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
      switch (mconf__compositePkUrlScheme()) {
        case ns.MULTI_PK_TO_URL_KEY_VALUE_PATH:
          return pk.replace(/,/, '/')
        case ns.MULTI_PK_TO_URL_ORDERED_VALUES_PATH:
          return __models__compositePkOrderedList(pk, '/')
        case ns.MULTI_PK_TO_URL_ORDERED_SEPERATED_VALUES:
          return __models__compositePkOrderedList(pk, mconf__compositePkSep() || '_')
      }
    }

    function __models__compositePkOrderedList(pk, separator) {
      var keyValuePairs = pk.split(','),
        values = []
      keyValuePairs.forEach(function(keyValuePair) {
        values.push(keyValuePair.replace(/^[^=]+=/, ''))
      })
      return values.join(separator)
    }

    var GInstanceFields = {},
      GInstanceFieldsCounter = 0

    function ifields__getter(field) {
      /**
       * For any given instance field say 'xyz', there is a storage
       * attribute (to be used internally only) to support its getter
       * and setter. The value of this internal attribute is returned
       * by the getter function
       */
      return function() {
        return GInstanceFields[imeta__get(this).$i[field]]
      }
    }

    function ifields__setter(field) {
      /**
       * The value of the internal storage attribute corresponding to
       * the given field is overwritten with the new value. Also, in
       * case the older value was changed, an event related to instance
       * change is fired. This is not done in case the instance is not
       * created at, where the setter would be called when the instance
       * fields are being populated. Also, if it's explicitly marked
       * to not fire an event on change, then also the event firing is
       * skippped.
       */
      return function(newVal) {
        var imeta = imeta__get(this),
          counter = imeta.$i[field],
          oldVal = GInstanceFields[counter]
        if (oldVal !== newVal) {
          if (!imeta.$d || imeta.$s) {
            GInstanceFields[counter] = newVal
            return
          }
          imeta.$c[field] = {
            oldVal: oldVal,
            newVal: newVal
          }
        } else {
          delete imeta.$c[field]
        }
      }
    }

    function ifields__set(value) {
      GInstanceFields[GInstanceFieldsCounter] = value
      return GInstanceFieldsCounter++
    }

    function ifields__count() {
      return Object.keys(GInstanceFields).length
    }

    function ifields__delete(idx) {
      delete GInstanceFields[idx]
    }

    var GInstanceMeta = {},
      GInstanceMetaCounter = 0

    function imeta__next() {
      return GInstanceMetaCounter++
    }

    function imeta__new(instance) {
      var imeta = GInstanceMeta[instance.__meta_idx__] = {}
      imeta.$m = models__get(instance.__model__)
      imeta.$i = {}
      imeta.$c = {}
      return imeta
    }

    function imeta__get(instance) {
      return GInstanceMeta[instance.__meta_idx__]
    }

    function imeta__count() {
      return Object.keys(GInstanceMeta).length
    }

    function imeta__setKey(instance, imeta, key) {
      delete GInstanceMeta[instance.__meta_idx__]
      instance.__meta_idx__ = key
      imeta.$k = key
      GInstanceMeta[key] = imeta
    }

    function imeta__delete(instance) {
      delete GInstanceMeta[instance.__meta_idx__]
    }

    function imeta__print() {
      console.debug('Instance Meta Counter:', GInstanceMetaCounter)
      console.debug('Number of Instances:', imeta__count())
      for (var key in GInstanceMeta) {
        console.debug('Key', key, 'Instance', GInstanceMeta[key])
      }
    }

    ns.imeta = imeta__print

    function iparse__ensureRequiredFields(modelName, modelDef, data, instanceCreated) {
      for (var field in modelDef) {
        if (__iparse__isFieldRequired(modelDef[field], instanceCreated) &&
          !(field in data)) {
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
        (fieldDef.pk && !instanceCreated && !fieldDef.auto) ||
        fieldDef.fk ||
        !fieldDef.optional)
    }

    function iparse__validateData(modelName, modelDef, data, instance) {
      for (var field in data) {
        if (field in modelDef) {
          __iparse__validateField(modelName, field, modelDef[field], data)
          instance[field] = data[field]
        }
      }
    }

    function __iparse__validateField(modelName, field, fieldDef, data) {
      var fieldType = mparse__fieldType(modelName, field, fieldDef)
      switch (fieldType) {
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
      var type = fieldDef.type,
        value = data[field]
      if (__iparse__unallowedNull(value, fieldDef)) {
        consoleError('Setu.iparse !', modelName, 'model field', field,
          'is null in', data, 'which is not allowed')
        throw new TypeError(MSG_INVALID_INSTANCE_DATA)
      } else if (null !== value && !__iparse__primitiveOfType(value, type)) {
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
      if (utils__isObject(data[field])) {
        var dummy = {}
        iparse__validateData(relatedModel.name, relatedModel.def,
          data[field], dummy)
      } else {
        var relatedPk = relatedModel.pks[0]
        __iparse__validateFkAgainstModel(relatedModel.name, relatedPk, relatedModel.def[relatedPk], modelName, field, fieldDef, data)
      }
    }

    function __iparse__validateFkAgainstModel(relatedName, relatedPk, relatedPkDef, modelName, field, fieldDef, data) {
      var relatedPkType = relatedPkDef.type,
        value = data[field]
      if (__iparse__unallowedNull(value, fieldDef)) {
        consoleError('Setu.iparse !', modelName, 'model field', field,
          'is a foreign key to', relatedName, 'and is null in', data,
          'which is not allowed')
        throw new TypeError(MSG_INVALID_INSTANCE_DATA)
      } else if (null !== value && !__iparse__primitiveOfType(value, relatedPkType)) {
        consoleError('Setu.iparse !', modelName, 'model field', field,
          'is a foreign key to', relatedName, 'whose primary key', relatedPk,
          'is of type', relatedPkType, 'but the value is', value,
          'in', data)
        throw new TypeError(MSG_INVALID_INSTANCE_DATA)
      }
    }

    function __iparse__validateArrayField(modelName, field, fieldDef, data) {
      if (!utils__isArray(data[field])) {
        consoleError('Setu.iparse !', modelName, 'model field', field,
          'must be an array but the value is', data[field], 'in', data)
        throw new TypeError(MSG_INVALID_INSTANCE_DATA)
      }
      var type = mparse__arrayFieldType(modelName, field, fieldDef.elements)
      switch (type) {
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
        if (__iparse__unallowedNull(element, elemsDef)) {
          consoleError('Setu.iparse !', modelName, 'model array field', field,
            'contains a null element in', data, 'which is not allowed')
        } else if (null !== element && !__iparse__primitiveOfType(element, type)) {
          consoleError('Setu.iparse !', modelName, 'model array field', field,
            'has', element, 'in', data, 'which is not of required type:', type)
          throw new TypeError(MSG_INVALID_INSTANCE_DATA)
        }
      })
    }

    function __iparse__validateFkArray(modelName, field, elemsDef, data) {
      data[field].forEach(function(element) {
        var relatedModel = models__get(elemsDef.fk)
        if (utils__isObject(element)) {
          var dummy = {}
          iparse__validateData(relatedModel.name, relatedModel.def, element, dummy)
        } else {
          var relatedPk = relatedModel.pks[0]
          __iparse__validateFkArrayMemberAgainstModel(relatedModel.name, relatedPk, relatedModel.def[relatedPk], modelName, element, elemsDef, data)
        }
      })
    }

    function __iparse__validateFkArrayMemberAgainstModel(relatedName, relatedPk,
      relatedPkDef, modelName, element, elemsDef, data) {
      var relatedPkType = relatedPkDef.type
      if (__iparse__unallowedNull(element, elemsDef)) {
        consoleError('Setu.iparse !', modelName, 'model field', field,
          'contains foreign keys to', relatedName, 'and cannot have nulls',
          'but nulls are there in', data)
        throw new TypeError(MSG_INVALID_INSTANCE_DATA)
      } else if (null !== element && !__iparse__primitiveOfType(element, relatedPkType)) {
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
      switch (type) {
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

    function instances__setup(instance) {
      var imeta = imeta__new(instance),
        model = imeta.$m
      for (var field in model.def) {
        var fieldDef = model.def[field],
          initValue = ('array' !== fieldDef.type ? undefined : [])
        imeta.$i[field] = ifields__set(initValue)
      }
    }

    function instances__delete(instance) {
      var model = models__get(instance.__model__),
        imeta = imeta__get(instance)
      for (var field in model.def) {
        var idx = imeta.$i[field]
        ifields__delete(idx)
      }
      imeta__delete(instance)
      console.debug('Setu.models',
        ifields__count(), 'instance fields in runtime',
        imeta__count(), 'instances in runtime')
    }

    function instances__init(instance, data, forDetailRes) {
      if (data) {
        var modelName = instance.__model__
        model = models__get(modelName),
          modelDef = model.def,
          imeta = imeta__get(instance)
        iparse__ensureRequiredFields(modelName, modelDef, data, imeta.$d)
        iparse__validateData(modelName, modelDef, data, instance)
        imeta.$d = true
        imeta__setKey(instance, imeta, modelName + ':' + instances__pkDef(instance))
        if (!forDetailRes) {
          res__registerDetail(instance, imeta)
        }
      }
    }

    function instances__pkDef(instance) {
      var model = models__get(instance.__model__)
      if (1 === model.pks.length) {
        return instance[model.pks[0]]
      } else {
        var keyValuePairs = []
        model.pks.forEach(function(pk) {
          keyValuePairs.push(pk + '=' + instance[pk])
        })
        return keyValuePairs.join(';')
      }
    }

    function instances__pkDefToObj(def) {
      var parts = def.split(';'),
        obj = {}
      parts.forEach(function(part) {
        var kv = part.split('=')
        obj[kv[0]] = kv[1]
      })
      return obj
    }

    function instances__ensureNotCreated(instance, imeta, onsuccess) {
      if (imeta.$d) {
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
      for (var field in modelDef) {
        if (modelDef.hasOwnProperty(field) && !modelDef[field].auto) {
          dataToSend[field] = instance[field]
        }
      }
      return dataToSend
    }

    function instances__ensureCreated(instance, imeta, onsuccess) {
      if (!imeta.$d) {
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
      for (var field in imeta.$c) {
        if (imeta.$c.hasOwnProperty(field)) {
          dataToSend[field] = imeta.$c[field].newVal
        }
      }
      return (Object.keys(dataToSend).length ? dataToSend : null)
    }

    function instances__updateChanges(instance, imeta) {
      if (!Object.keys(imeta.$c).length) {
        return
      }
      var changes = {}
      for (var field in imeta.$c) {
        changes[field] = imeta.$c[field]
      }
      imeta.$s = true
      for (var field in changes) {
        instance[field] = changes[field].newVal
      }
      imeta.$s = false
      imeta.$c = {}
      return changes
    }

    function instances__createUrl(instance, imeta) {
      var url = imeta.$m.prefix + mconf__trailingChar()
      if (imeta.$qp) {
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
      if (imeta.$qp) {
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
      for (var field in modelDef) {
        if (modelDef.hasOwnProperty(field)) {
          data[field] = instance[field]
        }
      }
      return data
    }

    function backend__getList(model, params, onsuccess, onerror) {
      params = params || ''
      var url = models__listUrl(model, params)
      http__get(url, {
        format: 'json'
      }, function(response) {
        __backend__processList(model, response, onsuccess)
      }, function(e) {
        console.warn('Setu.backend ! list', model, e.message, e.stack)
        if ('function' === typeof(onerror)) {
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
      http__get(url, {
          format: 'json'
        }, function(response) {
          __backend__processDetail(model, response, onsuccess)
        },
        function(e) {
          console.warn('Setu.backend ! detail', model, e.message, e.stack)
          if ('function' === typeof(onerror)) {
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
      http__get(url, {
          format: 'json'
        }, function(response) {
          __backend__patchInstance(instance, imeta, response)
          onsuccess()
        },
        function(e) {
          console.warn('Setu.backend ! detail', model, e.message, e.stack)
          onerror()
        })
    }

    function backend__getApi(path, queryparams, onsuccess, onerror) {
      http__get(path + (queryparams ? '?' + queryparams : ''), {
          format: 'json'
        },
        function(response) {
          onsuccess(response.data)
        },
        function(e) {
          console.warn('Setu.backend ! api', path, queryparams, e.message, e.stack)
          if ('function' === typeof(onerror)) {
            onerror({})
          }
        })
    }

    function backend__saveInstance(instance, onsuccess, onerror) {
      var imeta = imeta__get(instance)
      if (imeta.$d) {
        return __backend__updateInstance(instance, imeta, onsuccess, onerror)
      } else {
        return __backend__createInstance(instance, imeta, onsuccess, onerror)
      }
    }

    function __backend__createInstance(instance, imeta, onsuccess, onerror) {
      if (!instances__ensureNotCreated(instance, imeta, onsuccess)) {
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
        if ('function' === typeof(onerror)) {
          onerror(JSON.parse(e.message))
        }
      })
    }

    function __backend__updateInstance(instance, imeta, onsuccess, onerror) {
      if (!instances__ensureCreated(instance, imeta, onsuccess)) {
        return
      }
      var dataToSend = instances__updateData(instance, imeta)
      if (!dataToSend) {
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
        if ('function' === typeof(onerror)) {
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
      if (Object.keys(imeta.$c).length) {
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
        if ('function' === typeof(callback)) {
          callback(param)
        }
      }, function(e) {
        console.info('Setu.instances ! delete', instance, e.message, e.stack)
      })
    }

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
      if (!which || !which.length) {
        return false
      }
      var resources = {}
      which.every(function(res) {
        var title = res.title,
          resource
        if ((resource = GResources[res.key]) && resource.value) {
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
      if (!which || !which.length) {
        onsuccess({})
        return
      }
      var results = {}
      which.forEach(function(res) {
        var resource = 'string' === typeof(res) ?
          res__parseKey(needed, res) :
          res
        resource = __res__getOrSet(resource)
        __res__fetchOrGet(resource, function(result) {
          results[result.title] = result.value
          if (Object.keys(results).length === which.length) {
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
      if (def) {
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
      var resource = {},
        saveKey = key
      key = __res__evalKeyTemplates(key, needed)
      var match = __res__keyTemplateRegexMatch(key, saveKey)
      resource.key = __res__regexMatchToKey(match)
      var model = models__get_silent(match[3]), // match[3] -> model OR
        url = GResourcesDefs[match[3]] // match[3] -> api resource name
      if (!model && !url) {
        consoleError('Setu.resources ! invalid resource key', saveKey, key)
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
      res__regexMatchToParams(match, resource)
      if (model) {
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
      if (syn__isTemplate(key)) {
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
      if (!match || 12 !== match.length) {
        consoleError('Setu.resources !', 'invalid key', saveKey)
        throw new TypeError(MSG_INVALID_META)
      }
      return match
    }

    function __res__regexMatchToKey(match) {
      return (match[3] + // Model
        (match[5] ? (':' + match[5]) : '') + // Primary Key
        (match[10] ? ('|' + match[10]) : '')) // Filter Params
    }

    function res__regexMatchToParams(match, resource) {
      if (match[10]) { // match[10] -> params
        resource.params = __res__colonSeparatedListToObj(match[10])
        resource.queryparams = match[10].replace(/;/g, '&')
      }
    }

    function res__buildQueryParams(resource) {
      if (!resource.params) {
        return
      }
      var params = []
      for (var key in resource.params) {
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
      var pairs = str.split(';'),
        obj = {}
      pairs.forEach(function(pair) {
        var match = pair.match(/^([^=]+)=(.*)$/)
        obj[match[1]] = match[2]
      })
      return obj
    }

    function __res__regexMatchToPk(match, resource) {
      if (match[5]) { // match[5] -> pk (one or multi)
        resource.pk = match[5]
        /* Multi-type PK if it's a comma separated list */
        resource.pkType = (match[5].match(/,/) ? PK_TYPE_MULTI : PK_TYPE_ONE)
        resource.type = KW_DETAIL
      } else {
        resource.type = KW_LIST
      }
    }

    function __res__genericTitle(resource) {
      return (KW_DETAIL === resource.type ?
        mconf__instanceName(resource.model.name) :
        mconf__listName(resource.model.name))
    }

    function __res__getOrSet(resource) {
      if (!GResources[resource.key]) {
        GResources[resource.key] = resource
        console.debug('Setu.resources +', resource.key, resource)
      } else {
        var title = resource.title
        resource = GResources[resource.key]
        if (title != resource.title) {
          resource.title = title
        }
        console.debug('Setu.resources .', resource.key, resource)
      }
      return resource
    }

    function __res__fetchOrGet(resource, onsuccess) {
      switch (resource.type) {
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
      if (resource.value && !forceFetch) {
        onsuccess(__res__repr(resource))
      } else {
        if (!__res__hasFetchQueue(resource)) {
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
          },
          function(empty) {
            var rep = {
              title: resource.title,
              value: empty
            }
            __res__processFetchQueue(resource, rep)
            onsuccess(rep)
          })
      }
    }

    function res__reloadList(resource, onsuccess) {
      while (resource.value.length) {
        instances__purge(resource.value.pop())
      }
      __res__getList(resource, onsuccess, true)
    }

    function res__getDetail(resource, onsuccess) {
      if (resource.value) {
        onsuccess(__res__repr(resource))
      } else {
        if (!__res__hasFetchQueue(resource)) {
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
            var rep = {
              title: resource.title,
              value: empty
            }
            __res__processFetchQueue(resource, rep)
            onsuccess(rep)
          })
      }
    }

    function res__reloadDetail(resource, onsuccess) {
      if (!__res__hasFetchQueue(resource)) {
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
          if ('function' === typeof(onsuccess)) {
            onsuccess(rep)
          }
        },
        function() {
          var rep = __res__repr(resource)
          __res__processFetchQueue(resource, rep)
        })
    }

    function __res__getApi(resource, onsuccess) {
      if (resource.value) {
        onsuccess(__res__repr(resource))
      } else {
        backend__getApi(resource.api, resource.queryparams, function(data) {
          resource.value = data
          console.info('Setu.resources + ://', resource)
          var rep = __res__repr(resource)
          onsuccess(rep)
        }, function(empty) {
          onsuccess({
            title: resource.title,
            value: empty
          })
        })
      }
    }

    var __ResourceFetchQueue = {}

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
      if (resource.key in __ResourceFetchQueue) {
        var queued = __ResourceFetchQueue[resource.key].slice()
        delete __ResourceFetchQueue[resource.key]
        console.log('Setu.resources Q-', resource.key, queued)
        queued.forEach(function(callback) {
          if ('function' === typeof(callback)) {
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
      if (key in GResources) {
        __res__unregister(GResources[key])
        delete GResources[key]
      }
      console.info('Setu.resources x', key)
    }

    function res__clear() {
      for (var key in GResources) {
        if (GResources.hasOwnProperty(key)) {
          res__flushOne(key)
        }
      }
      console.info('Setu.resources x []')
    }

    function res__registerDetail(instance, imeta) {
      if (!(imeta.$k in GResources)) {
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
      if (KW_LIST === resource.type) {
        lists__unregisterEvents(resource)
      } else if (KW_DETAIL === resource.type) {
        details__unregisterEvents(resource)
      }
    }

    function res__getByKey(key) {
      return GResources[key]
    }

    function res__getModelInstances(modelName) {
      var list = []
      for (var key in GResources) {
        var resource = GResources[key]
        if (KW_DETAIL === resource.type && modelName === resource.model.name) {
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

    function lists__registerEvents(list) {
      if (!list.registered) {
        events__registerFrom(ns.EVENT_INSTANCE_CREATE, list.model.name, __lists__onInstanceCreate, list)
        events__registerFrom(ns.EVENT_INSTANCE_CHANGE, list.model.name, __lists__onInstanceChange, list)
        events__registerFrom(ns.EVENT_INSTANCE_DELETE, list.model.name, __lists__onInstanceDelete, list)
        var paramsFks = {}
        if (list.params) {
          paramsFks = __lists__paramFks(list)
          for (var fk in paramsFks) {
            var fkModel = paramsFks[fk]
            events__registerFrom(ns.EVENT_INSTANCE_CHANGE, (fkModel + ':' + list.params[fk]),
              __lists__onFilterInstanceChange, list)
            events__registerFrom(ns.EVENT_INSTANCE_DELETE, (fkModel + ':' + list.params[fk]),
              __lists__onFilterInstanceDelete, list)
          }
        }
        for (var fk in list.model.fks) {
          if (!(fk in paramsFks)) {
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
      if (list.registered) {
        events__unregisterFrom(ns.EVENT_INSTANCE_CREATE, list.model.name, list)
        events__unregisterFrom(ns.EVENT_INSTANCE_CHANGE, list.model.name, list)
        events__unregisterFrom(ns.EVENT_INSTANCE_DELETE, list.model.name, list)
        var paramsFks = {}
        if (list.params) {
          paramsFks = __lists__paramFks(list)
          for (var fk in paramsFks) {
            var fkModel = paramsFks[fk]
            events__unregisterFrom(ns.EVENT_INSTANCE_CHANGE, (fkModel + ':' + list.params[fk]), list)
            events__unregisterFrom(ns.EVENT_INSTANCE_DELETE, (fkModel + ':' + list.params[fk]), list)
          }
        }
        for (var fk in list.model.fks) {
          if (!(fk in paramsFks)) {
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
      if (__lists__instanceBelongs(list, instance)) {
        __lists__addInstance(list, instance)
      }
    }

    function __lists__onInstanceChange(list, instance, changed) {
      var belongs = __lists__instanceBelongs(list, instance),
        member = list.value.contains(instance)
      if (!belongs && member) {
        __lists__removeInstance(list, instance)
      } else if (belongs && !member) {
        __lists__addInstance(list, instance)
      } else if (member) {
        var updateConf = mconf__listUpdate(MODEL_CONF_UL_FIELDS, list.model.name)
        if (updateConf) {
          __lists__confBasedReload(list, updateConf, changed)
        }
      }
    }

    function __lists__onInstanceDelete(list, instance) {
      if (list.value.contains(instance)) {
        __lists__removeInstance(list, instance)
      }
    }

    function __lists__onFilterInstanceChange(list, instance, changed) {
      var updateConf = mconf__listUpdate(MODEL_CONF_UL_FILTERS, list.model.name, instance)
      if (updateConf && (
          !list.value.length ||
          __lists__depOnInstance(list, instance))) {
        __lists__confBasedReload(list, updateConf, changed)
      }
    }

    function __lists__onFilterInstanceDelete(list, instance) {
      if (!list.value.length || __lists__depOnInstance(list, instance)) {
        events__fireTo(ns.EVENT_LIST_RESOURCE_DELETE, list.key, list)
        res__flushOne(list)
      }
    }

    function __lists__onFkInstanceCreate(list, instance) {
      var updateConf = mconf__listUpdate(MODEL_CONF_UL_INSTANCE_FKS, list.model.name, instance)
      if (updateConf && __lists__depOnInstanceFkAlways(updateConf)) {
        lists__reloadOnChange(list, true)
      }
    }

    function __lists__onFkInstanceChange(list, instance, changed) {
      var updateConf = mconf__listUpdate(MODEL_CONF_UL_INSTANCE_FKS, list.model.name, instance)
      if (updateConf && (
          !list.value.length ||
          __lists__memberHasInstanceAsFk(list, instance) ||
          __lists__depOnInstanceFkAlways(updateConf))) {
        __lists__confBasedReload(list, updateConf, changed)
      }
    }

    function __lists__onFkInstanceDelete(list, instance) {
      if (!list.value.length || __lists__memberHasInstanceAsFk(list, instance)) {
        lists__reloadOnChange(list, true)
        return
      }
      var updateConf = mconf__listUpdate(MODEL_CONF_UL_INSTANCE_FKS, list.model.name, instance)
      if (updateConf && __lists__depOnInstanceFkAlways(updateConf)) {
        lists__reloadOnChange(list, true)
      }
    }

    function __lists__instanceBelongs(list, instance) {
      if (list.params) {
        for (var field in list.params) {
          if (field in instance) {
            return __lists__paramFieldMatchesInstanceField(list, instance, field)
          } else if (!__lists__paramFieldMatchesPrimitive(list.params[field], mconf__filter(instance, field))) {
            console.debug('Setu.lists !ϵ - special list filter excludes instance', instance, list, field)
            return false
          }
        }
      }
      console.debug('Setu.lists ϵ', instance, list)
      return true
    }

    function __lists__paramFieldMatchesInstanceField(list, instance, field) {
      if (utils__isObject(instance[field])) {
        return __lists__paramFieldMatchesAnFkField(list, instance, field)
      } else {
        if (!__lists__paramFieldMatchesPrimitive(list.params[field], instance[field])) {
          console.debug('Setu.lists !ϵ - list filter different from instance field', instance, field, list)
          return false
        }
      }
      return true
    }

    function __lists__paramFieldMatchesAnFkField(list, instance, field) {
      var imeta = imeta__get(instance),
        fk = imeta.$m.def[field].fk
      if (fk) {
        return __lists__paramFieldMatchesFkPks(list, instance, field, models__get(fk))
      } else {
        consoleError('Setu.lists !ϵ - field in instance is an object however it was not defined as a foreign key', instance, field, list)
        return false
      }
    }

    function __lists__paramFieldMatchesFkPks(list, instance, field, fkModel) {
      if (1 === fkModel.pks.length) {
        if (!__lists__paramFieldMatchesPrimitive(list.params[field], instance[field] && instance[field][fkModel.pks[0]])) {
          console.debug('Setu.lists !ϵ - list filter differs from related instance fk field', instance, field, list)
          return false
        }
      } else {
        var pkObj = instances__pkDefToObj(list.params[field])
        for (var pk in pkObj) {
          if (!__lists__paramFieldMatchesPrimitive(pkObj[pk], instance[field] && instance[field][pk])) {
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
        if ('string' !== typeof(instanceField)) {
          var adapted = adapters__run(ns.ADAPTER_FILTER_VALUE, paramsField)
          return eval(adapted[0]) === instanceField
        } else {
          return paramsField === instanceField
        }
      } catch (e) {
        console.debug(e.messsage, e.stack)
        return false
      }
    }

    function __lists__paramFks(list) {
      var fks = {}
      for (var param in list.params) {
        if (param in list.model.fks) {
          fks[param] = list.model.fks[param]
        }
      }
      return fks
    }

    function __lists__depOnInstance(list, instance) {
      var depends = false,
        modelDef = list.model.def
      for (var param in list.params) {
        if (modelDef[param] &&
          modelDef[param].fk === instance.__model__ &&
          instances__pkDef(instance).toString() === list.params[param]) {
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
      for (var fk in list.model.fks) {
        if (fkModel === list.model.fks[fk]) {
          fkField = fk
          break
        }
      }
      if (!fkField) {
        return false
      }
      var result = false
      for (var idx = 0; idx < list.value.length; ++idx) {
        var member = list.value[idx]
        if (member[fkField] === instances__pkDef(instance)) {
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
      if (list.value.length > 1) {
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
      if (true === updateConf) {
        toReload = true
      } else {
        for (var field in changed) {
          if (field in updateConf) {
            toReload = true
            break
          }
        }
      }
      if (toReload) {
        console.debug('Setu.lists reload-on-instance-change', toReload, list, updateConf, changed)
        lists__reloadOnChange(list, true)
      }
    }

    function lists__reloadOnChange(list, unsetModifiers) {
      console.info('Setu.lists ^ reload', list)
      if (unsetModifiers) {
        var match = list.key.match(REGEX_RESOURCE),
          pageSizeParam = Setu.pageSizeParam || Setu.PAGE_SIZE_PARAM,
          pageSize = list.params[pageSizeParam]
        res__regexMatchToParams(match, list)
        if (pageSize) {
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

    function details__registerEvents(detail) {
      if (!detail.registered) {
        var key = imeta__get(detail.value).$k
        events__registerFrom(ns.EVENT_INSTANCE_CHANGE, key,
          __details__onInstanceChange, detail)
        events__registerFrom(ns.EVENT_INSTANCE_DELETE, key,
          __details__onInstanceDelete, detail)
        detail.registered = true
      }
    }

    function details__unregisterEvents(detail) {
      if (detail.registered) {
        var key = imeta__get(detail.value).$k
        events__unregisterFrom(ns.EVENT_INSTANCE_CHANGE, key, detail)
        events__unregisterFrom(ns.EVENT_INSTANCE_DELETE, key, detail)
        detail.registered = false
      }
    }

    function __details__onInstanceChange(detail, instance, data) {
      events__fireTo(ns.EVENT_DETAIL_RESOURCE_CHANGE, detail.key, detail,
        data)
    }

    function __details__onInstanceDelete(detail) {
      events__fireTo(ns.EVENT_DETAIL_RESOURCE_DELETE, detail.key, detail)
    }

    ns.reloadDetail = res__reloadDetail

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
        if (resource) {
          console.debug('Setu.sse create $ resource available in-memory', resKey, GResources[resouce].value)
          return
        }
        __sse__fetchDetail(resKey)
      } catch (err) {
        console.warn(err.message, err.stack)
      }
    }

    function __sse__onupdate(e) {
      try {
        var data = JSON.parse(e.data)
        console.info('Setu.sse --> update', data)
        var resKey = data.model + ':' + data.pk,
          resource = GResources[resKey]
        if (resource) {
          if (resource.fetched_at >= data.timestamp) {
            console.debug('Setu.sse update $ resource in-memory copy is newer',
              resKey, data.timestamp, resource.fetched_at)
            return
          }
          res__reloadDetail(resource)
        } else {
          __sse__fetchDetail(resKey)
        }
      } catch (err) {
        console.warn(err.message, err.stack)
      }
    }

    function __sse__ondelete() {
      try {
        var data = JSON.parse(e.data)
        console.info('Setu.sse --> delete', data)
        var resKey = data.model + ':' + data.pk,
          resource = GResources[resKey]
        if (!resource) {
          console.debug('Setu.sse delete $ non-existent resource', resKey)
          return
        }
        var instance = resource.value,
          imeta = imeta__get(instance)
        events__fireTo(ns.EVENT_INSTANCE_DELETE, imeta.$k, instance)
        events__fireTo(ns.EVENT_INSTANCE_DELETE, instance.__model__, instance)
        instances__purge(instance)
      } catch (err) {
        console.warn(err.message, err.stack)
      }
    }

    function __sse__fetchDetail(resKey) {
      var resource = res__parseKey(resKey)
      res__getDetail(resource, function(res) {
        var instance = res.value
        if (Object.keys(instance).length) {
          // session was permitted by backend to load this instance
          events__fireTo(ns.EVENT_INSTANCE_CREATE, instance.__model__, instance)
        }
      })
    }

    var GScopeMeta = {},
      GScopeMetaCounter = 0

    function emeta__new(element) {
      if (!(ELEM_META_ATTR in element)) {
        ++GScopeMetaCounter
        element[ELEM_META_ATTR] = GScopeMetaCounter
        GScopeMeta[element[ELEM_META_ATTR]] = {}
      }
      return emeta__get(element)
    }

    function emeta__get(element) {
      return GScopeMeta[element[ELEM_META_ATTR]]
    }

    function emeta__delete(element) {
      if (__emeta__exists(element)) {
        delete GScopeMeta[element[ELEM_META_ATTR]]
        delete element[ELEM_META_ATTR]
      }
    }

    function __emeta__exists(element) {
      return ELEM_META_ATTR in element
    }

    function emparse__init(element) {
      var emeta = emeta__new(element)
      __emparse__init(emeta)
      if (!Object.keys(emeta.$p.$n).length) {
        var par = element.parentNode
        while (par && !app__isAppRoot(par)) {
          var emetaParent = emeta__get(par)
          if (emetaParent && emetaParent.$p && emetaParent.$p.$n) {
            __emparse__copyNeeded(emetaParent, emeta)
            return
          }
          par = par.parentNode
        }
      }
      return emeta
    }

    function emparse__setupLoopElement(element, sibling, key, iterator) {
      emparse__setupSibling(element, sibling)
      var emeta = emeta__get(sibling)
      emeta.$p.$c = {}
      emeta.$p.$c[key] = iterator
      emeta.$p.$n[key] = iterator
      emeta.$p.$l = true
    }

    function emparse__setupSibling(element, sibling) {
      var emetaSibling = emeta__new(sibling),
        emeta = emeta__get(element)
      __emparse__init(emetaSibling)
      __emparse__copyNeeded(emeta, emetaSibling)
      __emparse__copyOthers(emeta, emetaSibling)
    }

    function emparse__swapOriginRelWithSibling(element, emeta, sibling) {
      if (emeta.$p.$o) {
        var origin = emeta.$p.$o,
          emetaOrigin = emeta__get(origin),
          emetaSibling = emeta__get(sibling)
        emetaOrigin.$p.$i.remove(element)
        emetaOrigin.$p.$i.push(sibling)
        emetaSibling.$p.$o = origin
      }
    }

    function emparse__unlatchLoopOrigin(element, emeta) {
      var origin = emeta.$p.$o
      if (origin) {
        var emetaOrigin = emeta__get(origin)
        emetaOrigin.$p.$i.remove(element)
      }
      delete emeta.$p.$o
    }

    function emparse__findContext(element) {
      while (element && !app__isAppRoot(element)) {
        var emeta = emeta__get(element)
        if (emeta.$p && emeta.$p.$c) {
          for (var key in emeta.$p.$c) {
            console.debug('Setu.emparse context', key, emeta.$p.$c[key])
            return emeta.$p.$c[key]
          }
        }
        if ('form' === element.tagName.toLowerCase() &&
          element.hasAttribute(META_INSTANCE)) {
          var res = res__getByKey(element.getAttribute(META_INSTANCE))
          if (res) {
            return res.value
          }
        }
        element = element.parentNode
      }
      return null
    }

    function __emparse__init(emeta) {
      emeta.$p = emeta.$p || {}
      emeta.$p.$n = emeta.$p.$n || {}
    }

    function __emparse__copyNeeded(emetaFrom, emetaTo) {
      for (var key in emetaFrom.$p.$n) {
        emetaTo.$p.$n[key] = emetaFrom.$p.$n[key]
      }
    }

    function __emparse__copyOthers(emetaFrom, emetaTo) {
      var $n = emetaFrom.$p.$n
      delete emetaFrom.$p.$n
      for (var key in emetaFrom.$p) {
        emetaTo.$p[key] = emetaFrom.$p[key]
      }
      emetaFrom.$p.$n = $n
    }

    var GHiddenTemplates = {},
      GHiddenTemplateCounter = 0

    function ehide__clear() {
      GHiddenTemplates = {}
      GHiddenTemplateCounter = 0
    }

    function ehide__add(content) {
      var idx = GHiddenTemplateCounter++
      GHiddenTemplates[idx] = content
      return idx
    }

    function ehide__get(idx) {
      return GHiddenTemplates[idx]
    }

    function ehide__delete(idx) {
      delete GHiddenTemplates[idx]
    }

    function elements__overwrite(element, data) {
      var tempParent = __elements__createTempParent(element)
      tempParent.innerHTML = data
      var siblings = Array.prototype.slice.call(tempParent.childNodes)
      while (tempParent.childNodes.length) {
        element.parentNode.insertBefore(tempParent.childNodes[0], element)
      }
      elements__remove(element)
      return siblings
    }

    function elements__clone(element) {
      var emeta = emeta__get(element)
      if (!emeta || !emeta.$p) {
        consoleError('Setu.elements !', 'internal error while trying to eval binds',
          element)
        throw new Error(MSG_INTERNAL_ERROR)
      }
      var $p = emeta.$p,
        temp = elements__createTemp(element, $p.$t)
      element.parentNode.insertBefore(temp.childNodes[0], element)
      var sibling = element.previousSibling
      emparse__setupSibling(element, sibling)
      emparse__swapOriginRelWithSibling(element, emeta, sibling)
      if ($p.$c) {
        emeta__get(sibling).$p.$c = $p.$c
      }
      elements__remove(element)
      console.info('Setu.elements + bind ||', element, sibling)
      return sibling
    }

    function elements__remove(element) {
      emeta__delete(element)
      if (document.body.contains(element)) {
        console.info('Setu.elements x', element)
        element.parentNode.removeChild(element)
      }
    }

    function elements__hide(element) {
      var $p = emeta__get(element).$p,
        comment = document.createComment(__elements__commentContent(element, $p)),
        emetaComment = emeta__new(comment)
      emetaComment.$p = $p
      element.parentNode.insertBefore(comment, element)
      elements__remove(element)
      console.debug('Setu.elements _', element, comment)
      return comment
    }

    function __elements__commentContent(element, $p) {
      return META_CONTENT + ':' + ehide__add($p.$t || element.outerHTML)
    }

    function elements__show(comment) {
      if (!comment || !document.body.contains(comment)) {
        console.debug('Setu.elements ignore dead comment', comment)
        return
      }
      var element = __elements__restore(comment),
        emetaComment = emeta__get(comment),
        $p = emetaComment.$p
      if ($p.$i) {
        $p.$i.forEach(function(iter) {
          elements__remove(iter)
        })
        delete $p.$i
      }
      var emeta = emeta__new(element)
      emeta.$p = $p
      emeta__delete(comment)
      comment.parentNode.removeChild(comment)
      console.info('Setu.elements $ re-birth', element, emeta.$p)
      return element
    }

    function elements__fromTemplate(element) {
      return __elements__fromText(element, elements__template(element))
    }

    function elements__template(element) {
      var emeta = emeta__get(element)
      if (!emeta || !emeta.$p || !emeta.$p.$t) {
        consoleError('Setu.elements ! template-to-node', element, emeta)
        throw new Error(MSG_INTERNAL_ERROR)
      }
      console.debug('Setu.elements template', emeta.$p.$t)
      return emeta.$p.$t
    }

    function elements__createTemp(node, data) {
      var temp = __elements__createTempParent(node)
      temp.innerHTML = data
      return temp
    }

    function __elements__restore(comment) {
      var idx = __elements__hideIdx(comment),
        restored = __elements__fromText(comment, ehide__get(idx))
      ehide__delete(idx)
      comment.parentNode.insertBefore(restored, comment)
      return restored
    }

    function __elements__hideIdx(comment) {
      return parseInt(comment.textContent.replace(/^.*:/g, ''), 10)
    }

    function elements__tempFromComment(comment) {
      return __elements__fromText(comment, ehide__get(__elements__hideIdx(comment)))
    }

    function __elements__fromText(node, text) {
      var tempParent = __elements__createTempParent(node)
      tempParent.innerHTML = text
      return tempParent.firstChild
    }

    function __elements__createTempParent(node) {
      var parentTagName = node.parentNode.tagName.toLowerCase()
      if ('body' === parentTagName) {
        parentTagName = 'div'
      }
      return document.createElement(parentTagName)
    }

    function syn__existsIn(element) {
      return (syn__hasAttrs(element) ||
        syn__hasTemplates(element) ||
        __syn__hasSynChildren(element))
    }

    function __syn__hasSynChildren(element) {
      return 0 != syn__childrenCount(element)
    }

    function syn__childrenCount(element) {
      return element.querySelectorAll(META_ATTRS_SELECTOR).length
    }

    function syn__hasTemplates(element) {
      return syn__isTemplate(element.outerHTML)
    }

    function syn__isTemplate(text) {
      return text.match(REGEX_TEMPLATE) || text.match(REGEX_TRUTHY_TEMPLATE)
    }

    function syn__hasAttrs(element) {
      for (var idx = 0; idx < META_ATTRIBUTES.length; ++idx) {
        if (element.hasAttribute(META_ATTRIBUTES[idx])) {
          return true
        }
      }
      return false
    }

    function syn__parseClick(element) {
      var str = element.getAttribute(META_CLICK),
        parsed
      if (!str) {
        return null
      }
      var match
      if (KW_DELETE === str) {
        return {
          type: str
        }
      } else {
        return {
          type: KW_CODE,
          code: str
        }
      }
    }

    function syn__parseFormEntity(form) {
      if (form.hasAttribute(META_MODEL)) {
        return {
          type: KW_MODEL,
          model: models__get(form.getAttribute(META_MODEL))
        }
      } else if (form.hasAttribute(META_INSTANCE)) {
        var resourceKey = form.getAttribute(META_INSTANCE)
        var resource = res__parseKey(emeta__get(form).$p.$n, resourceKey)
        if (KW_DETAIL !== resource.type) {
          consoleError('Setu.meta !', 'invalid instance resource key', resourceKey, form)
          throw new TypeError(MSG_INVALID_META)
        }
        return {
          type: KW_INSTANCE,
          resource: resource
        }
      }
      return null
    }

    function syn__parseBind(element) {
      return syn__parseResList(element, META_BIND)
    }

    function syn__parseRequire(element) {
      return syn__parseResList(element, META_REQUIRE)
    }

    var __resTypes = [KW_LIST, KW_DETAIL, KW_API]

    function syn__parseResList(element, attrib) {
      if (!element.hasAttribute(attrib)) {
        return []
      }
      var array = element.getAttribute(attrib).split(',')
      for (var i = 0; i < array.length; ++i) {
        if (!emeta__get(element)) {
          consoleError('Setu.meta !', 'element not init before parsing res list', element)
        }
        var resource = res__parseKey(emeta__get(element).$p.$n, array[i])
        if (!__resTypes.contains(resource.type)) {
          consoleError('Setu.meta !', 'invalid key', attrib, array[i], element)
          throw new TypeError(MSG_INVALID_META)
        }
        array[i] = resource
      }
      console.debug('Setu.meta keys -> resources', attrib, element, array)
      return array
    }

    function syn__hasBindKey(node, key) {
      if (node.hasAttribute(META_BIND)) {
        var keyRegex = new RegExp('[,]?' + __syn__regexFix(key) + '[,]?')
        return !!node.getAttribute(META_BIND).match(keyRegex)
      }
      return false
    }

    function __syn__regexFix(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    }

    var GHidden = []

    function hidden__clear() {
      GHidden = []
    }

    function hidden__add(node) {
      GHidden.push(node)
    }

    function hidden__all() {
      return GHidden
    }

    function hidden__replace(hidden) {
      GHidden = hidden
    }

    var GParsingCount = 0,
      GPageDone = false,
      GIncludes = {}

    function parser__clear() {
      hidden__clear()
      ehide__clear()
      GParsingCount = 0
      GPageDone = false
      console.debug('Setu.parser x')
    }

    function parser__isDone() {
      console.debug('Setu.parser ✓', (0 === GParsingCount))
      return 0 === GParsingCount
    }

    function parser__endgame() {
      links__setup()
      listmodifiers__setupFilters()
      events__fire(ns.EVENT_META_RENDER, ns)
      if (!GPageDone) {
        GPageDone = true
        events__fire(ns.EVENT_PAGE_RENDER, ns)
        if (!sse__isSetup() && GModelsConfig && GModelsConfig.instanceEventStream) {
          sse__setup(GModelsConfig.instanceEventStream)
        }
      }
    }

    function __parser__markParsing(element) {
      if (ns.appOnParseBegin) {
        ns.appOnParseBegin('setu')
      }
      ++GParsingCount
      console.debug('Setu.parser @', element, '#parsing', GParsingCount)
    }

    function __parser__markDoneParsing(element) {
      --GParsingCount
      if (ns.appOnParseEnd) {
        ns.appOnParseEnd()
      }
      console.debug('Setu.parser $', element, '#parsing', GParsingCount)
      parser__$()
    }

    function parser__$() {
      if (!observer__running() && !binds__parsing() && parser__isDone()) {
        parser__endgame()
      }
    }

    function parser__parseElement(element, resuming) {
      if (!document.body.contains(element)) {
        return
      }
      if (!resuming) {
        __parser__markParsing(element)
      }
      emparse__init(element)
      var emeta = emeta__get(element)
      switch (__parser__parseElement(element, emeta.$p, emeta.$p.$n)) {
        case PARSE_ERROR:
        case PARSE_PENDING:
          return
        case PARSE_REMOVED:
        case PARSE_REPLACED:
          break
        case PARSE_DONE:
          __parser__postParseElement(element, emeta)
          console.debug('Setu.parser $ parse', element, emeta.$p)
          break
      }
      __parser__markDoneParsing(element)
    }

    /* eslint-disable complexity */
    function __parser__parseElement(element, $p, needed) {
      if (syn__hasTemplates(element)) {
        __parser__evalAttrs(element, needed)
      }
      if (element.hasAttribute(META_INCLUDE)) {
        console.info('Setu.parser @ _', META_INCLUDE, element, $p)
        var url = element.getAttribute(META_INCLUDE).trim()
        if (GIncludes[url]) {
          var idx = $_(element).index(),
            par = element.parentNode,
            targets = __parser__processInclude(element, $p, needed, GIncludes[url])
          if (!document.body.contains(element)) {
            __parser__parseReplaced(par, targets, needed)
            return PARSE_REPLACED
          }
        } else {
          http__get(element.getAttribute(META_INCLUDE).trim(), {}, function(response) {
            GIncludes[url] = response.data
            var idx = $_(element).index(),
              par = element.parentNode,
              targets = __parser__processInclude(element, $p, needed, response.data)
            if (!document.body.contains(element)) {
              __parser__parseReplaced(par, targets, needed)
              __parser__markDoneParsing(element)
            } else {
              parser__parseElement(element, true)
            }
          }, function(e) {
            var err = JSON.parse(e.message)
            events__fire(ns.EVENT_AJAX_ERROR, null, {
              status: err.status,
              error: err.error
            })
          })
          return PARSE_PENDING
        }
      }
      if (element.hasAttribute(META_REQUIRE)) {
        var required = syn__parseRequire(element),
          resources
        if (!(resources = res__ifAvailable(required))) {
          __parser__require(element, $p, needed, required)
          return PARSE_PENDING
        }
        for (var key in resources) {
          needed[key] = resources[key]
        }
        console.info('Setu.parser $', META_REQUIRE, element, resources, needed)
      }
      if (element.hasAttribute(META_BIND) && !$p.$t && !element.hasAttribute(META_LOOP)) {
        var bindAttr = element.getAttribute(META_BIND)
        if (syn__isTemplate(bindAttr)) {
          element.setAttribute(META_BIND, evals__doTemplate(needed, bindAttr))
        }
        $p.$t = element.outerHTML
        console.info('Setu.parser $', META_BIND, element, $p.$t)
      }
      if (element.hasAttribute(META_LOOP)) {
        var match
        if (null === (match = element.getAttribute(META_LOOP).trim().match(REGEX_LOOP))) {
          return PARSE_ERROR
        }
        var key = match[1],
          arrayName = match[2],
          array
        try {
          array = evals__doExpr(needed, arrayName)
        } catch (e) {
          consoleError('Setu.parser !', META_LOOP, match[2], element, $p, e.message, e.stack)
          return PARSE_ERROR
        }
        if (!array) {
          consoleError('Setu.parser !', META_LOOP, match[2], element, $p, array)
          return PARSE_ERROR
        }
        needed[arrayName] = array
        var copies = __parser__createLoopElements(element, $p, key, array),
          comment = elements__hide(element)
        __parser__setLoopElementsOrigin(comment, copies)
        hidden__add(comment)
        console.info('Setu.parser $', META_LOOP, element, $p)
        copies.slice().forEach(function(copy) {
          parser__parseElement(copy)
        })
        return PARSE_REMOVED
      }
      if (element.hasAttribute(META_IF)) {
        var expr = element.getAttribute(META_IF).trim(),
          condition = false
        try {
          condition = evals__doExpr(needed, expr)
        } catch (e) {
          consoleError('Setu.parser !', META_IF, expr, element, $p, e.message, e.stack)
          return PARSE_ERROR
        }
        if (!condition) {
          if (!$p.$l) {
            console.info('Setu.parser _', META_IF, element, $p)
            if (element.hasAttribute(META_BIND)) {
              binds__register(element)
            }
            hidden__add(elements__hide(element))
          } else {
            console.info('Setu.parser x', META_IF, element, $p)
            emparse__unlatchLoopOrigin(element, emeta__get(element))
            elements__remove(element)
          }
          return PARSE_REMOVED
        }
        console.info('Setu.parser $', META_IF, element, $p)
      }
      if (element.hasAttribute(META_DECLARE)) {
        var declares = element.getAttribute(META_DECLARE).split(';')
        for (var idx = 0; idx < declares.length; ++idx) {
          var match
          if (null === (match = declares[idx].trim().match(REGEX_DECLARE))) {
            return PARSE_ERROR
          }
        }
        for (var idx = 0; idx < declares.length; ++idx) {
          var match = declares[idx].trim().match(REGEX_DECLARE),
            name = match[1],
            rval = match[2]
          try {
            rval = evals__doExpr(needed, rval)
            needed[name] = rval
          } catch (e) {
            consoleError('Setu.parser !', META_DECLARE, name, match[2], element, $p, e.message, e.stack)
            return PARSE_ERROR
          }
        }
        console.info('Setu.parser $', META_DECLARE, element, declares, needed)
      }
      if (syn__hasTemplates(element)) {
        __parser__evalAttrs(element, needed)
        if (syn__isTemplate(element.innerHTML)) {
          var children = Array.prototype.slice.call(element.childNodes)
          children.forEach(function(child) {
            if (NODE_TYPE_TEXT === child.nodeType && syn__isTemplate(child.textContent)) {
              __parser__parseText(child, element, needed)
            }
          })
        }
        console.info('Setu.parser $ {{}}', element, $p)
      }
      __parser__parseChildren(element)
      return PARSE_DONE
    }
    /* eslint-enable complexity */

    function __parser__evalAttrs(element, needed) {
      for (var idx = 0; idx < element.attributes.length; ++idx) {
        var attr = element.attributes[idx]
        if (syn__isTemplate(attr.value)) {
          attr.value = evals__doTemplate(needed, attr.value)
        }
      }
    }

    function __parser__processInclude(element, $p, needed, html) {
      var targets
      observer__stop()
      if (element.hasAttribute(META_REPLACE)) {
        targets = __parser__replace(element, $p, needed, html)
      } else {
        __parser__include(element, $p, needed, html)
      }
      observer__monitor(GAppElement)
      return targets
    }

    function __parser__replace(element, $p, needed, html) {
      var siblings = elements__overwrite(element, html)
      console.info('Setu.parser $', META_INCLUDE, element, $p)
      return siblings
    }

    function __parser__include(element, $p, needed, html) {
      element.innerHTML = html
      element.removeAttribute(META_INCLUDE)
      console.info('Setu.parser $', META_INCLUDE, element, $p)
    }

    function __parser__parseReplaced(par, nodes, needed) {
      nodes.forEach(function(node) {
        if (NODE_TYPE_ELEMENT === node.nodeType) {
          parser__parseElement(node)
        } else if (NODE_TYPE_TEXT === node.nodeType && syn__isTemplate(node.textContent)) {
          __parser__parseText(node, par, needed)
        }
      })
    }

    function __parser__require(element, $p, needed, required) {
      console.info('Setu.parser @ _', META_REQUIRE, element, $p)
      res__get(required, {}, function(resources) {
        for (var key in resources) {
          needed[key] = resources[key]
        }
        console.info('Setu.parser $', META_REQUIRE, element, resources, needed)
        parser__parseElement(element, true)
      })
    }

    function __parser__createLoopElements(element, $p, key, array) {
      observer__stop()
      var html = __parser__getCopiesHtml(element, array),
        numElements = array.length,
        temp = elements__createTemp(element, html),
        copies = Array.prototype.slice.call(temp.childNodes)
      for (idx = 0; idx < numElements; ++idx) {
        var iterator = array[idx],
          sibling = temp.childNodes[0]
        emparse__setupLoopElement(element, sibling, key, iterator)
        element.parentNode.insertBefore(sibling, element)
        console.info('Setu.parser +', META_LOOP, sibling, emeta__get(sibling).$p, key, iterator, element, $p)
      }
      observer__monitor(GAppElement)
      return copies
    }

    function __parser__getCopiesHtml(element, array) {
      var loopAttr = element.getAttribute(META_LOOP),
        idx
      element.removeAttribute(META_LOOP)
      var html = '',
        numElements = array.length
      for (idx = 0; idx < numElements; ++idx) {
        html += element.outerHTML
      }
      element.setAttribute(META_LOOP, loopAttr)
      return html
    }

    function __parser__setLoopElementsOrigin(origin, elements) {
      var emetaOrigin = emeta__get(origin)
      emetaOrigin.$p.$i = elements
      elements.forEach(function(element) {
        var emeta = emeta__get(element)
        emeta.$p.$o = origin
      })
    }

    function __parser__parseText(text, par, needed) {
      var evaledText = evals__doTemplate(needed, text.textContent.trim()).trim(),
        div = document.createElement('div')
      div.innerHTML = evaledText
      while (div.childNodes.length) {
        par.insertBefore(div.childNodes[0], text)
      }
      par.removeChild(text)
    }

    function __parser__parseChildren(element) {
      var children = Array.prototype.slice.call(element.childNodes)
      children.forEach(function(child) {
        if (child.nodeType === NODE_TYPE_ELEMENT && syn__existsIn(child)) {
          parser__parseElement(child)
        }
      })
    }

    function __parser__postParseElement(element, emeta) {
      if (element.hasAttribute(META_CLICK)) {
        click__setup(element, emeta)
      }
      if (element.hasAttribute(META_PAGESIZE)) {
        listmodifiers__setupListPageSize(element)
      } else if (element.hasAttribute(META_PAGESET)) {
        listmodifiers__setupListPageSet(element)
      } else if (element.hasAttribute(META_FILTER)) {
        listmodifiers__setupListFilter(element)
      }
      if ('form' === element.tagName.toLowerCase()) {
        forms__setup(element, emeta)
      } else if ('select' === element.tagName.toLowerCase()) {
        forms__fixSelect(element)
      } else if ('option' === element.tagName.toLowerCase()) {
        var select = element.parentNode
        while (select && 'select' !== select.tagName.toLowerCase()) {
          select = select.parentNode
        }
        if (select && !$_(element).next()) {
          forms__fixSelect(select)
        }
      }
      if (element.hasAttribute(META_BIND)) {
        binds__register(element, emeta)
      }
    }

    var GBound = {},
      GParsingBinds = false,
      GBindQueue = [],
      GBindProcessingCookie = '__gbpc__',
      GProcessingBinds = false

    events__register(ns.EVENT_LIST_RESOURCE_CREATE, function(ignored, resource) {
      __binds__event({
        handler: __binds__onListCreate,
        resource: resource
      })
    }, GBindProcessingCookie)

    function binds__clear() {
      GBound = {}
      GParsingBinds = false
      GBindQueue = []
      GProcessingBinds = false
      console.info('Setu.binds x')
    }

    function binds__register(element, emeta) {
      __binds__registerResources(syn__parseBind(element))
      console.debug('Setu.binds $ +', element, emeta)
    }

    function __binds__registerResources(binds) {
      binds.forEach(function(resource) {
        binds__doIfNotYetDone(resource)
      })
    }

    function binds__doIfNotYetDone(resource) {
      var key = resource.key
      if (!(key in GBound)) {
        __binds__register(key, resource.type)
        GBound[key] = true
      }
    }

    function __binds__register(key, type) {
      if (KW_DETAIL === type) {
        events__registerFrom(ns.EVENT_DETAIL_RESOURCE_CHANGE, key,
          function(ignored, resource, data) {
            __binds__event({
              handler: __binds__onDetailChange,
              resource: resource,
              data: data,
            })
          }, GBindProcessingCookie
        )
        events__registerFrom(ns.EVENT_DETAIL_RESOURCE_DELETE, key,
          function(ignored, resource) {
            __binds__event({
              handler: __binds__onDetailDelete,
              resource: resource,
            })
          }, GBindProcessingCookie)
      } else if (KW_LIST === type) {
        events__registerFrom(ns.EVENT_LIST_RESOURCE_CHANGE, key,
          function(ignored, resource) {
            __binds__event({
              handler: __binds__onListChange,
              resource: resource,
            })
          }, GBindProcessingCookie)
        events__registerFrom(ns.EVENT_LIST_RESOURCE_DELETE, key,
          function(ignored, resource) {
            __binds__event({
              handler: __binds__onListDelete,
              resource: resource,
            })
          }, GBindProcessingCookie)
      }
      console.info('Setu.binds $', key, type)
    }

    function __binds__event(handler) {
      GBindQueue.push(handler)
      __binds__process()
    }

    function __binds__process(force) {
      if (!GProcessingBinds) {
        GProcessingBinds = true
      } else if (!force) {
        console.info('Setu.binds @ another bind is being processed')
        return
      }
      while (GBindQueue.length) {
        var handler = GBindQueue.shift()
        handler.handler(undefined, handler.resource, handler.data)
        if (!parser__isDone()) {
          // the bind processing created few async items, so need
          // to wait till meta render
          console.info('Setu.binds $ parser !$')
          events__register(ns.EVENT_META_RENDER, function() {
            __binds__process(true)
          }, GBindProcessingCookie)
          console.info('Setu.binds _ will resume post meta render')
          return
        }
      }
      GProcessingBinds = false
      events__unregister(ns.EVENT_META_RENDER, GBindProcessingCookie)
      console.info('Setu.binds $ queue empty')
    }

    function __binds__onDetailChange(ignored, resource, data) {
      console.info('Setu.binds @ detail-change', resource, data)
      var key = resource.key,
        toEval = __binds__resEffected(key),
        evaled = __binds__clone(toEval)
      for (var field in data) {
        if (data.hasOwnProperty(field)) {
          Array.prototype.push.apply(evaled, __binds__showResEffected(key))
        }
      }
      __binds__parse(evaled)
      console.info('Setu.binds $ detail-change', resource, data)
    }

    function __binds__onDetailDelete(ignored, resource) {
      console.info('Setu.binds @ detail-delete', resource)
      __binds__removeResEffected(resource.key)
      console.info('Setu.binds $ detail-delete', resource)
    }

    function __binds__onListCreate(ignored, resource) {
      console.info('Setu.binds @ list-create', resource)
      __binds__processResEffected(resource)
      console.info('Setu.binds $ list-create', resource)
    }

    function __binds__onListChange(ignored, resource) {
      console.info('Setu.binds @ list-change', resource)
      __binds__processResEffected(resource)
      console.info('Setu.binds $ list-change', resource)
    }

    function __binds__onListDelete(ignores, resource) {
      console.info('Setu.binds @ list-delete', resource)
      __binds__removeResEffected(resource.key)
      console.info('Setu.binds $ list-delete', resource)
    }

    function __binds__removeResEffected(key) {
      var elements = __binds__resEffected(key)
      elements.forEach(function(element) {
        elements__remove(element)
      })
      console.info('Setu.parser $ remove-bound', key, elements)
    }

    function __binds__processResEffected(resource) {
      var key = resource.key
      var toEval = __binds__resEffected(key),
        evaled = __binds__clone(toEval)
      Array.prototype.push.apply(evaled, __binds__showResEffected(key))
      __binds__parse(evaled)
    }

    function __binds__resEffected(key) {
      var potentials = app__descendents('[' + META_BIND + ']'),
        elements = []
      potentials.forEach(function(element) {
        if (syn__hasBindKey(element, key)) {
          var emeta = emeta__get(element)
          console.info('Setu.binds @ bound', key, element, emeta.$p, emeta.$p.$t)
          elements.push(element)
        }
      })
      return elements
    }

    function __binds__clone(elements) {
      var clones = []
      observer__stop()
      elements.forEach(function(element) {
        if (document.body.contains(element)) {
          console.debug('Setu.binds @ re-eval', element, emeta__get(element))
          clones.push(elements__clone(element))
        }
      })
      observer__monitor(GAppElement)
      return clones
    }

    function __binds__showResEffected(key) {
      var elements = [],
        hidden = []
      observer__stop()
      hidden__all().forEach(function(comment) {
        if (!document.body.contains(comment)) {
          console.debug('Setu.parser @ unhide x comment', comment)
          return
        }
        if (syn__hasBindKey(elements__tempFromComment(comment), key)) {
          elements.push(elements__show(comment))
        } else {
          hidden.push(comment)
        }
      })
      hidden__replace(hidden)
      observer__monitor(GAppElement)
      console.info('Setu.parser $ unhide', key, hidden, elements)
      return elements
    }

    function __binds__parse(evaled) {
      GParsingBinds = true
      evaled.forEach(function(element) {
        parser__parseElement(element)
      })
      GParsingBinds = false
      parser__$()
    }

    function binds__parsing() {
      return GParsingBinds
    }

    function forms__setup(form, emeta) {
      if (!document.body.contains(form) || emeta.$f) {
        return
      }
      events__register(ns.EVENT_META_RENDER, __forms__onMetaRender, form)
    }

    function __forms__onMetaRender(form) {
      events__unregister(ns.EVENT_META_RENDER, form)
      __forms__fixSelects(form)
      var parsed = syn__parseFormEntity(form)
      if (!parsed) {
        return
      }
      var emeta = emeta__get(form)
      switch (parsed.type) {
        case KW_MODEL:
          __forms__setup(form, emeta, models__createInstance(parsed.model))
          break
        case KW_INSTANCE:
          var resources
          if ((resources = res__ifAvailable([parsed.resource]))) {
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
      if (select.hasAttribute('value')) {
        var value = select.getAttribute('value'),
          option = select.querySelector('option[value="' + value + '"]')
        if (option) {
          select.value = option.value
          console.debug('Setu.forms select value', select, option)
          return
        }
      }
      var option = select.querySelector('option[selected]')
      if (option) {
        select.value = option.value
        console.debug('Setu.forms select value', select, option)
      }
    }

    function __forms__setup(form, emeta, instance) {
      emeta.$i = instance
      var _existingOnsubmit = ('function' === typeof(form.onsubmit) ? form.onsubmit : null),
        onsubmit = __forms__submitHandler(form, emeta)
      if (_existingOnsubmit) {
        form.onsubmit = function() {
          var ret = _existingOnsubmit()
          if (__forms__getRelated(form).length) {
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
        if (form.hasAttribute(FORM_RELATED_AS)) {
          console.debug('Setu.forms $ related-form submit', form)
          return false
        }
        try {
          /* Validate the form and any of its related forms */
          var relatedForms = __forms__getRelated(form)
          console.debug('Setu.forms ^ related', form, relatedForms)
          if (!__forms__validateAll(form, relatedForms)) {
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
      if (form.error || form.getAttribute('error')) {
        ret = false
      }
      return __forms__validateRelated(relatedForms) && ret
    }

    function __forms__validate(form) {
      return !(adapters__run(ns.ADAPTER_VALIDATE_FORM, form).contains(false))
    }

    function __forms__getRelated(form) {
      if (form.getAttribute('name')) {
        return document.querySelectorAll(
          'form[foreign-key="' + form.getAttribute('name') + '"]')
      }
      return []
    }

    function __forms__validateRelated(relatedForms) {
      var idx, failed = 0
      for (idx = 0; idx < relatedForms.length; ++idx) {
        var relatedForm = relatedForms[idx],
          _existingOnsubmit = relatedForm.onsubmit
        relatedForm.onsubmit = function() {
          _existingOnsubmit()
          return false
        }
        relatedForm.onsubmit()
        relatedForm.onsubmit = _existingOnsubmit
        if (relatedForm.error || relatedForm.hasAttribute('error')) {
          ++failed
        } else if (!__forms__validate(relatedForm)) {
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
      for (var idx = 0; idx < elements.length; ++idx) {
        var element = elements[idx],
          field = element.getAttribute(ATTR_NAME)
        if (field && field in model.def) {
          data[field] = __forms_formFieldToInstanceField(
            model.name, field, model.def[field], element.value)
          if ('' === data[field] && model.def[field].blankIsNull) {
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
      switch (fieldType) {
        case MODEL_FIELD_TYPE_PK:
          return __forms__evalIfNonString(fieldDef.type, value)
        case MODEL_FIELD_TYPE_PRIMITIVE:
          if ('' === value && fieldDef.blankIsNull) {
            return null
          }
          return __forms__evalIfNonString(fieldDef.type, value)
        case MODEL_FIELD_TYPE_FK:
          if ('' === value && fieldDef.blankIsNull) {
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
      if (relatedForms.length) {
        __forms__resetRelatedAs(form, emeta,
          relatedForms[0].getAttribute(FORM_RELATED_AS))
      }
      for (var idx = 0; idx < relatedForms.length; ++idx) {
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
      if (__forms__isFkArray(model.name, relatedAs, fieldDef)) {
        instance[relatedAs].splice(0, instance[relatedAs].length)
        instance[relatedAs] = []
      } else {
        instance[relatedAs] = undefined
      }
    }

    function __forms__isFkArray(modelName, relatedAs, fieldDef) {
      var fieldType = mparse__fieldType(modelName, relatedAs, fieldDef)
      if (MODEL_FIELD_TYPE_ARRAY === fieldType) {
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
      if (data) {
        if (imetaRelated.$d) {
          imetaRelated.$m.pks.forEach(function(pk) {
            data[pk] = relatedInstance[pk]
          })
        }
        if (utils__isArray(instance[relatedAs])) {
          if (imeta.$d) {
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
      if (form.hasAttribute(META_PARAMS)) {
        var imeta = imeta__get(emeta.$i)
        imeta.$qp = form.getAttribute(META_PARAMS)
      }
    }

    function __forms__resetAll(form, emeta, relatedForms) {
      if (form.hasAttribute(META_MODEL)) {
        // need to create a new instance now
        __forms__renewInstance(emeta)
        // reset related forms
        for (var idx = 0; idx < relatedForms.length; ++idx) {
          var relatedForm = relatedForms[idx],
            emetaRelForm = emeta__get(relatedForm)
          if (relatedForm.hasAttribute(META_MODEL)) {
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

    function click__setup(element, emeta) {
      if (emeta.$c) { // already setup
        return
      }
      var clickDetail = syn__parseClick(element)
      if (null === clickDetail) {
        consoleError('Setu.clicks ! invalid', META_CLICK,
          element.getAttribute(META_CLICK), element)
        throw new Error(MSG_INVALID_META)
      }
      __click__setupByType(clickDetail, element)
      emeta.$c = true
    }

    function __click__setupByType(clickDetail, element) {
      switch (clickDetail.type) {
        case KW_DELETE:
          $_(element).onclick(function(e) {
            utils__shuntEvent(e)
            var context = emparse__findContext(element)
            if (!context) {
              consoleError('Setu.clicks ! cannot find context',
                element.getAttribute(META_CLICK), element)
              throw new Error(MSG_INVALID_META)
            }
            console.info('Setu.click @ delete', context)
            var callback = null,
              param = null
            if (element.hasAttribute(META_DELETE_CALLBACK)) {
              try {
                callback = eval(element.getAttribute(META_DELETE_CALLBACK))
              } catch (e) {}
            }
            if (element.hasAttribute(META_DELETE_PARAM)) {
              try {
                param = element.getAttribute(META_DELETE_PARAM)
                param = eval(param)
              } catch (e) {}
            }
            backend__deleteInstance(context, callback, param)
          })
          console.debug('Setu.clicks + click handler', clickDetail.type, element)
          break
        case KW_CODE:
          $_(element).onclick(function(e) {
            utils__shuntEvent(e)
            /* eslint-disable no-eval */
            eval(clickDetail.code)
            /* eslint-enable no-eval */
          })
          break
      }
    }

    function links__setup() {
      app__descendents('a[href]').forEach(function(link) {
        var emeta = emeta__new(link)
        if (emeta.$l) { // already setup
          return true
        }
        var path = link.getAttribute('href').replace(/\?.*$/, '')
        if (routes__getDef(path)) {
          $_(link).onclick(function(e) {
            utils__shuntEvent(e)
            console.info('Setu.application navigating', link.getAttribute('href'))
            app__open(link.getAttribute('href'))
            return false
          })
          console.debug('Setu.links $ link-setup', link)
        }
        emeta.$l = true
      })
    }

    function listmodifiers__setupListPageSize(element) {
      var list = listmodifiers__checkElement(element, META_PAGESIZE),
        pageSizeParam = Setu.pageSizeParam || Setu.PAGE_SIZE_PARAM
      $_(element).onchange(function() {
        listmodifiers__modifyListGoToPageOne(list, pageSizeParam,
          parseInt($_(element).value(), 10))
      })
      listmodifiers__setInput(list, element, pageSizeParam)
    }

    function listmodifiers__setupListPageSet(element) {
      var list = listmodifiers__checkElement(element, META_PAGESET),
        pageSizeParam = Setu.pageSizeParam || Setu.PAGE_SIZE_PARAM,
        pageParam = Setu.pageParam || Setu.PAGE_PARAM,
        begin = 1 < list.page ? 1 : null,
        prevPrev = (2 < list.page ? list.page - 2 : null),
        prev = (1 < list.page ? list.page - 1 : null),
        next = (!list.last ? list.page + 1 : null),
        nextNext = (
          !list.last && list.count > (1 + list.page) * list.value.length ?
          list.page + 2 :
          null),
        end = (
          !list.last ?
          (list.count % list.value.length ?
            (list.count / list.value.length) + 1 :
            list.count / list.value.length) :
          null),
        html = ''
      html += begin ? '<a begin-sym enabled page=1>&laquo;</a>' : '<a begin-sym disabled>&laquo;</a>'
      html += prev ? '<a prev-sym enabled page=' + prev + '>&lt;</a>' : '<a prev-sym disabled>&lt;</a>'
      html += prevPrev ? '<a prev-prev enabled page=' + prevPrev + '>' + prevPrev + '</a>' : ''
      html += prev ? '<a prev enabled page=' + prev + '>' + prev + '</a>' : ''
      html += '<a current disabled>' + list.page + '</a>'
      html += next ? '<a next enabled page=' + next + '>' + next + '</a>' : ''
      html += nextNext ? '<a next-next enabled page=' + nextNext + '>' + nextNext + '</a>' : ''
      html += next ? '<a next-sym enabled page=' + next + '>&gt;</a>' : '<a next-sym disabled>&gt;</a>'
      html += end ? '<a end-sym enabled page=' + end + '>&raquo;</a>' : '<a end-sym disabled>&raquo;</a>'
      element.querySelectorAll('a').forEach(function(pageLink) {
        pageLink.parentNode.removeChild(pageLink)
      })
      observer__stop()
      $_(element).append(html)
      observer__monitor(GAppElement)
      element.querySelectorAll('a[enabled][page]')
        .forEach(function(pageLink) {
          $_(pageLink).onclick(function(e) {
            var page = parseInt(pageLink.getAttribute('page'), 10)
            list.params = list.params || {}
            list.params[pageParam] = page
            res__buildQueryParams(list)
            lists__reloadOnChange(list)
          })
        })
    }

    function listmodifiers__setupListFilter(element) {
      var list = listmodifiers__checkElement(element, META_FILTER)
      if (!element.hasAttribute(FILTER_PARAM)) {
        consoleError('Setu.list-modifiers ! invalid meta: no', FILTER_PARAM,
          META_FILTER, element)
        throw new Error(MSG_INVALID_META)
      }
      var param = element.getAttribute(FILTER_PARAM)
      $_(element).onchange(function() {
        listmodifiers__modifyListGoToPageOne(list, param, $_(element).value())
      })
    }

    function listmodifiers__setupFilters() {
      app__descendents('[' + META_FILTER + '][' + FILTER_PARAM + ']')
        .forEach(function(element) {
          var list = listmodifiers__checkElement(element, META_FILTER),
            param = element.getAttribute(FILTER_PARAM)
          listmodifiers__setInput(list, element, param)
        })
    }

    function listmodifiers__modifyListGoToPageOne(list, param, value) {
      console.debug('Setu.list-modifiers @p1', list, param, value)
      var pageParam = Setu.pageParam || Setu.PAGE_PARAM
      list.params = list.params || {}
      if (value) {
        list.params[param] = value
      } else {
        delete list.params[param]
      }
      delete list.params[pageParam] // reset page to 1
      res__buildQueryParams(list)
      lists__reloadOnChange(list)
    }

    function listmodifiers__setInput(list, element, param) {
      if (list.params[param]) {
        $_(element).value(list.params[param].toString())
      } else if ('select' === element.tagName.toLowerCase()) {
        forms__fixSelect(element)
      }
    }

    function listmodifiers__checkElement(element, attr) {
      var res = syn__parseResList(element, attr),
        list
      if (1 !== res.length) {
        consoleError('Setu.list-modifiers ! invalid meta', attr, element)
        throw new Error(MSG_INVALID_META)
      }
      if (!(list = res__getByKey(res[0].key))) {
        consoleError('Setu.list-modifiers ! resource not available', attr, element, res)
        throw new Error(MSG_INTERNAL_ERROR)
      }
      if (KW_LIST !== list.type) {
        consoleError('Setu.list-modifiers ! resource is not a list', attr, element, list)
        throw new Error(MSG_INVALID_META)
      }
      return list
    }

    var GAppElement,
      GAppName,
      GAppInitialHtml

    function app__run(name, settings) {
      console.info('Setu.application -->')
      GAppElement = document.querySelector('[' + META_APP + ']')
      if (!GAppElement) {
        consoleError('Setu.application',
          'no element with', META_APP, 'attribute defined')
        throw new TypeError(MSG_BADLY_CONFIGURED)
      }
      GAppName = name
      GAppInitialHtml = GAppElement.innerHTML
      config__setup(settings.config || {})
      routes__setup(settings.routes || {})
      models__setup(settings.models, settings.modelFilters,
        settings.config && settings.config.models)
      res__setup(settings.resources || {})
      app__navigate()
    }

    function __app__reload() {
      console.info('Setu.application refresh -->')
      __app__flush()
      app__navigate()
    }

    function app__open(url) {
      console.info('Setu.application -->', url)
      history__push(url)
      app__navigate()
    }

    function __app__redirect(url) {
      console.info('Setu.application redirecting -->', url)
      history__replace(url)
      app__navigate()
    }

    function app__navigate() {
      __app__clear()
      __app__exec()
    }

    function __app__clear() {
      var toFlush = config__pathChangeFlush()
      if (utils__isObject(toFlush) && 'resources' in toFlush) {
        toFlush.resources.forEach(res__flushOne)
      }
      routes__clear()
      parser__clear()
      binds__clear()
      evals__clear()
      http__clear()
      __app__restoreOrigContent()
      console.info('Setu.application x')
    }

    function __app__restoreOrigContent() {
      GAppElement.innerHTML = GAppInitialHtml
    }

    function __app__exec() {
      routes__resolve(function() {
        if (routes__exists()) {
          if (routes__toRedirect()) {
            __app__redirect(routes__redirect())
          } else if (routes__toInclude()) {
            __app__handleInclude()
          } else {
            __app__handleLoaded()
          }
        } else {
          __app__handleLoaded()
        }
      })
    }

    function __app__handleInclude() {
      var url = routes__include()
      console.debug('Setu.application page needs', url)
      evals__add({
        queryparams: __app__findQueryParams()
      })
      if (routes__toFlush()) {
        __app__flush()
      }
      var required = routes__require() || []
      res__get(required, {}, function(values) {
        evals__add(values)
        observer__monitor(GAppElement)
        __app__loadHtml(url)
      })
    }

    function __app__findQueryParams() {
      var queryparams = {}
      if (window.location.search) {
        var querystring = window.location.search.replace(/^\?/, '')
        var params = querystring.split('&')
        params.forEach(function(param) {
          var pair = param.split('=')
          queryparams[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
        })
      }
      console.debug('Setu.application queryparams', queryparams)
      return queryparams
    }

    function __app__loadHtml(url) {
      if (GIncludes[url]) {
        __app__setHtml(GIncludes[url])
      } else {
        http__get(url, {}, function(response) {
          __app__setHtml(response.data)
          GIncludes[url] = response.data
        }, function(e) {
          var err = JSON.parse(e.message)
          events__fire(ns.EVENT_AJAX_ERROR, null, {
            status: err.status,
            error: err.error
          })
        })
      }
    }

    function __app__setHtml(html) {
      GAppElement.innerHTML = html + GAppInitialHtml
      if (!GAppElement.querySelectorAll(META_ATTRS_SELECTOR).length) {
        parser__endgame()
      }
    }

    function __app__flush() {
      res__clear()
      console.info('Setu.application resources x')
    }

    function __app__handleLoaded() {
      observer__monitor(GAppElement)
      GAppElement.querySelectorAll(META_ATTRS_SELECTOR)
        .forEach(function(element) {
          parser__parseElement(element)
        })
      if (parser__isDone()) {
        parser__endgame()
      }
    }

    function app__isAppRoot(element) {
      return GAppElement === element
    }

    function app__descendents(selector) {
      return GAppElement.querySelectorAll(selector)
    }

    ns.run = app__run
    ns.refresh = __app__reload
    ns.open = app__open
    ns.clear = parser__clear
    ns.app = GAppElement

  }(window.Setu = window.Setu || {}))

$_.ready(function() {
  Setu.adapters['Django'] = [{
    purpose: Setu.ADAPTER_AJAX_BEFORE_SEND,
    handler: function(ignore, xhr, options, context) {
      if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(options.method) && !
        context.crossDomain) {
        var csrfToken = document.cookie.match(new RegExp(
          'csrftoken=([^;]+)'));
        if (csrfToken) {
          xhr.setRequestHeader('X-CSRFToken', csrfToken[1])
          console.debug('DjangoAdapter', 'added X-CSRFToken header',
            csrfToken[1])
        }
      }
    }
  }, {
    purpose: Setu.ADAPTER_FILTER_VALUE,
    handler: function(ignore, value) {
      switch (value) {
        case 'True':
          return 'true'
        case 'False':
          return 'false'
        case 'None':
          return 'null'
        default:
          return value
      }
    }
  }]
})

$_.ready(function() {
  function isArray(v) {
    return ('[object Array]' === Object.prototype.toString.call(v))
  }

  function isObject(v) {
    return ('object' === typeof(v) && !isArray(v))
  }

  function findPage(url, pageParam) {
    var params = url.replace(/^[^\?]*\?/, '').split('&'),
      page = 1
    for (var idx = 0; idx < params.length; ++idx) {
      var param = params[idx],
        parts = param.split('=')
      if (pageParam === parts[0]) {
        page = parseInt(parts[1], 10)
        break
      }
    }
    return page
  }
  Setu.adapters['DjangoRestFramework'] = [{
    purpose: Setu.ADAPTER_MODELS_LIST,
    handler: function(ignore, response) {
      data = response.data
      if (isObject(data)) {
        var pageParam = Setu.pageParam || Setu.PAGE_PARAM,
          page, last = false
        if (data.next) {
          page = findPage(data.next, pageParam) - 1
        } else if (data.previous) {
          page = findPage(data.previous, pageParam) + 1
          last = true
        } else {
          page = 1
          last = true
        }
        return {
          page: page,
          last: last,
          count: data.count,
          list: data.results
        }
      } else if (isArray(data)) {
        return {
          page: 1,
          last: true,
          count: data.length,
          list: data
        }
      }
    }
  }]
})