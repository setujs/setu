var
  CONTENT_TYPE_JSON = 'application/json; charset=UTF-8',

  NODE_TYPE_ELEMENT = 1,  // ELEMENT_NODE
  NODE_TYPE_TEXT = 3,     // TEXT_NODE
  NODE_TYPE_COMMENT = 8,  // COMMENT_NODE

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
META_ATTRIBUTES.forEach(function (attr) {
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
